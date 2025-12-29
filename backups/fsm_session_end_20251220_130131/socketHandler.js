import { Server } from "socket.io";
import * as omiyageService from "../services/omiyageService.js";
import onboardingOrchestrator, { 
  InvalidTransitionError, 
  OptimisticLockError, 
  OnboardingNotInitializedError 
} from "../services/OnboardingOrchestrator.js";
import claudeBrain from "./ClaudeBrain.js";
import bcrypt from "bcryptjs";
import pool from "../db/pool.js";

import modeRouter from "./modeRouter.js";
import runStandardQuery from "./runStandardQuery.js";
import TanukiModeRouter from "./TanukiModeRouter.js";
import GodModeDebugger from "./GodModeDebugger.js";
import { getFirstLoginWelcomeBeat } from "../services/narrativeWelcomeService.js";

async function handleOnboardingFlow(socket) {
  try {
    await onboardingOrchestrator.initializeUser(socket.userId);
    
    const state = await onboardingOrchestrator.getCurrentState(socket.userId);
    
    if (!state) {
      console.error('[Onboarding] Failed to get state for', socket.userId);
      return;
    }

    console.log('[Onboarding] User state:', {
      userId: socket.userId,
      state: state.current_state,
      version: state.state_version
    });

    switch (state.current_state) {
      case 'new':
        const welcomeBeat = await getFirstLoginWelcomeBeat(socket.userId, "700002");
        if (welcomeBeat) {
          console.log("[WelcomeDebug] About to emit welcome to frontend:", welcomeBeat.beatId);
          socket.emit("command-response", {
            mode: "tanuki",
            from: "Claude",
            welcome: true,
            welcomeBeat
          });
        }
        await onboardingOrchestrator.advanceToAwaitingReadyAfterWelcome(
          socket.userId,
          welcomeBeat?.beat_id
        );
        break;

      case 'welcomed':
        await onboardingOrchestrator.transitionTo(
          socket.userId,
          'awaiting_ready',
          {},
          'reconnect_after_welcome'
        );
        break;

      case 'awaiting_ready':
        console.log('[Onboarding] User awaiting affirmative');
        break;

      case 'omiyage_offered':
        const result = await omiyageService.checkAndInitiateOmiyage(socket.userId);
        if (result) {
          if (result.type === 'resume_resolved') {
            const fulfilResult = await omiyageService.fulfilOmiyage(result.choiceId, socket.ownedCharacterId);
            const narrative = await omiyageService.buildFulfilmentNarrative(fulfilResult.object);
            socket.emit('omiyage:fulfilled', {
              choiceId: result.choiceId,
              object: fulfilResult.object,
              narrative
            });
            await onboardingOrchestrator.transitionTo(
              socket.userId,
              'onboarded',
              { choice_id: result.choiceId },
              'omiyage_auto_fulfilled_on_reconnect'
            );
          } else {
            socket.emit('omiyage:offer', {
              choiceId: result.choiceId,
              offerCount: result.offerCount,
              narrative: result.narrative,
              giverName: 'Claude The Tanuki'
            });
          }
        }
        break;

      case 'onboarded':
        console.log('[Onboarding] User already onboarded');
        break;
    }

  } catch (err) {
    if (err.name === 'OptimisticLockError') {
      console.warn('[Onboarding] Concurrent state change detected, silently recovering');
    } else if (err.name === 'InvalidTransitionError') {
      console.error('[Onboarding] Invalid transition attempted:', err.message);
    } else {
      console.error('[Onboarding] Flow error:', err);
    }
  }
}

import aliasTrainer from "./aliasTrainer.js";
import ContextMemoryManager from "./updateContextMemory.js";

import generateHexId from "../utils/hexIdGenerator.js";
import GiftEventHandler from "../knowledge/GiftEventHandler.js";

const giftEventHandler = new GiftEventHandler();
import cotwIntentMatcher from "./cotwIntentMatcher.js";
import { initializeRegistrationSockets } from "./registrationSocketHandler.js";

const contextMemory = new ContextMemoryManager();

function wrapSessionMiddleware(middleware) {
  return (socket, next) => middleware(socket.request, {}, next);
}

export default function initializeWebSocket(httpServer, sessionMiddleware) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
      credentials: true
    }
  });

  const publicIo = io.of("/public");
  initializeRegistrationSockets(publicIo);

  publicIo.on("connection", (socket) => {
    console.log("🟢 /public socket connected:", socket.id);
    socket.on("disconnect", () =>
      console.log("🔴 /public socket disconnected:", socket.id)
    );
  });

  const terminalIo = io.of("/terminal");

  terminalIo.use(wrapSessionMiddleware(sessionMiddleware));

  terminalIo.use(async (socket, next) => {
    const sess = socket.request.session;
    if (!sess || !sess.userId) {
      return next(new Error("Unauthorized"));
    }
    
    socket.userId = sess.userId;
    socket.username = sess.username;
    socket.accessLevel = sess.accessLevel;

    if (sess.ownedCharacterId) {
      socket.ownedCharacterId = sess.ownedCharacterId;
      console.log("[SessionDebug] ownedCharacterId from session:", socket.ownedCharacterId);
    } else {
      try {
        const result = await pool.query(
          'SELECT owned_character_id FROM users WHERE user_id = $1',
          [sess.userId]
        );
        if (result.rows.length > 0 && result.rows[0].owned_character_id) {
          socket.ownedCharacterId = result.rows[0].owned_character_id;
          sess.ownedCharacterId = socket.ownedCharacterId;
          console.log("[SessionDebug] ownedCharacterId fetched from DB:", socket.ownedCharacterId);
        } else {
          console.warn("[SessionDebug] No owned_character_id found for user:", sess.userId);
        }
      } catch (err) {
        console.error("[SessionError] Failed to fetch character ID:", err);
      }
    }
    
    next();
  });

  terminalIo.on("connection", (socket) => {
    console.log(`🟢 /terminal connected: ${socket.username} (lvl ${socket.accessLevel})`);
    handleOnboardingFlow(socket);

    socket.on("terminal-command", async (data) => {
      try {
        if (!socket.userId) {
          console.log("[WelcomeDebug] About to emit welcome to frontend:", welcomeBeat.beatId);
          socket.emit("command-response", { error: "NOT AUTHENTICATED" });
          return;
        }

        const { command } = data;
        console.log("[DEBUG] Received terminal command:", command);

        const state = await onboardingOrchestrator.getCurrentState(socket.userId);
        
        if (state && state.current_state === 'awaiting_ready') {
          const affirmativePattern = /^(yes|yeah|yep|sure|ok|okay|ready|let'?s go|go|begin|start)/i;
          if (affirmativePattern.test(command.trim())) {
            console.log('[Onboarding] Affirmative detected, advancing to omiyage');
            
            try {
              await onboardingOrchestrator.transitionTo(
                socket.userId,
                'omiyage_offered',
                {},
                'user_affirmative'
              );
              
              const result = await omiyageService.checkAndInitiateOmiyage(socket.userId);
              if (result && result.type !== 'resume_resolved') {
                socket.emit('omiyage:offer', {
                  choiceId: result.choiceId,
                  offerCount: result.offerCount,
                  narrative: result.narrative,
                  giverName: 'Claude The Tanuki'
                });
              }
              return;
            } catch (err) {
              if (err.name === 'OptimisticLockError') {
                console.warn('[Onboarding] Concurrent affirmative detected, re-checking state');
                const updatedState = await onboardingOrchestrator.getCurrentState(socket.userId);
                if (updatedState.current_state === 'omiyage_offered') {
                  console.log('[Onboarding] Already advanced by another process');
                  return;
                }
              } else if (err.name === 'InvalidTransitionError') {
                console.error('[Onboarding] Invalid transition from awaiting_ready:', err.message);
              }
              throw err;
            }
          }
        }

        const session = {
          id: socket.userId,
          username: socket.username,
          access_level: socket.accessLevel,
          context: socket.context || {}
        };

        const user = {
          userid: session.id,
          username: session.username,
          access_level: session.access_level,
          owned_character_id: socket.ownedCharacterId
        };

        const response = await claudeBrain.processQuery(command, session, user);

        socket.context = response.context || session.context;

        console.log("[DEBUG] ClaudeBrain response:", response);
        socket.emit("command-response", response);

      } catch (err) {
        console.error("Terminal command error:", err);
          console.log("[WelcomeDebug] About to emit welcome to frontend:", welcomeBeat.beatId);
        socket.emit("command-response", { error: "COMMAND FAILED" });
      }
    });

    socket.on("gift-wizard:get-realms", async (ack) => {
      if (!socket.userId) { ack?.({ success: false, error: "Not authenticated" }); return; }
      try {
        const r = await pool.query("SELECT DISTINCT realm FROM public.locations ORDER BY realm");
        const realms = r.rows.map(x => x.realm);
        ack?.({ success: true, realms });
        socket.emit("gift-wizard:realms", { success: true, realms });
      } catch (e) {
        ack?.({ success: false, error: e.message });
        socket.emit("gift-wizard:error", { error: e.message });
      }
    });

    socket.on("gift-wizard:get-locations", async (data) => {
      if (!socket.userId) return;
      try {
        const r = await pool.query(
          "SELECT location_id, name FROM public.locations WHERE realm = $1 ORDER BY name",
          [data.realm]
        );
        socket.emit("gift-wizard:locations", { success: true, locations: r.rows });
      } catch (e) {
        socket.emit("gift-wizard:error", { error: e.message });
      }
    });

    socket.on("gift-wizard:get-characters", async () => {
      if (!socket.userId) return;
      try {
        const r = await pool.query(
          "SELECT character_id, character_name, category FROM public.character_profiles WHERE category NOT IN ('Knowledge Entity') LIMIT 20"
        );
        socket.emit("gift-wizard:characters", { success: true, characters: r.rows });
      } catch (e) {
        socket.emit("gift-wizard:error", { error: e.message });
      }
    });

    socket.on("gift-wizard:get-givers-only", async () => {
      if (!socket.userId) return;
      try {
        const r = await pool.query(
          "SELECT DISTINCT cp.character_id, cp.character_name, cp.category FROM character_profiles cp JOIN character_inventory ci ON cp.character_id = ci.character_id WHERE cp.category NOT IN ('Knowledge Entity') ORDER BY cp.character_name"
        );
        socket.emit("gift-wizard:givers-only", { success: true, characters: r.rows });
      } catch (e) {
        socket.emit("gift-wizard:error", { error: e.message });
      }
    });

    socket.on("gift-wizard:get-giver-inventory", async (data) => {
      if (!socket.userId) return;
      try {
        const r = await pool.query(
          "SELECT ci.inventory_entry_id, ci.object_id, o.object_name, o.object_type, o.rarity FROM character_inventory ci JOIN objects o ON ci.object_id = o.object_id WHERE ci.character_id = $1",
          [data.giver_id]
        );
        socket.emit("gift-wizard:giver-inventory", { success: true, items: r.rows });
      } catch (e) {
        socket.emit("gift-wizard:error", { error: e.message });
      }
    });

    socket.on("gift-wizard:create-event", async (data) => {
      if (!socket.userId) return socket.emit("gift-wizard:error", { error: "Not authenticated" });
      try {
        const eventId = await generateHexId("multiverse_event_id");
        const r = await pool.query(
          "INSERT INTO public.multiverse_events (event_id, realm, location, event_type, involved_characters, outcome, timestamp, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
          [
            eventId,
            data.realm,
            data.location?.name || "Unknown",
            "gift_exchange",
            JSON.stringify({ giver: data.giver_id, receiver: data.receiver_id }),
            data.outcome,
            new Date().toISOString(),
            data.notes
          ]
        );
        socket.emit("gift-wizard:event-created", { success: true, event: r.rows[0] });
      } catch (e) {
        socket.emit("gift-wizard:error", { error: e.message });
      }
    });

    socket.on("menu-wizard:create-button", async (data, ack) => {
      if (!socket.userId) return ack?.({ success: false, error: "Not authenticated" });
      if (socket.accessLevel !== 11) return ack?.({ success: false, error: "Unauthorized - God Mode required" });

      try {
        const menuId = await generateHexId("wizard_guide_id");
        const insertSql = `
          INSERT INTO wizard_guides (wizard_id, wizard_name, wizard_type, description, frontend_file, version, access_levels, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, true)
          RETURNING *
        `;
        const result = await pool.query(insertSql, [
          menuId,
          data.name,
          data.type || "menu_button",
          data.description || "",
          data.frontend_file || "",
          "1.0",
          [11]
        ]);
        ack?.({ success: true, wizard: result.rows[0] });
      } catch (e) {
        ack?.({ success: false, error: e.message });
      }
    });

    socket.on("omiyage:accept", async (payload) => {
      console.log("[Omiyage] accept received", { user: socket.userId, payload });
      
      try {
        const { choiceId, chosenNumber } = payload;
        
        if (!choiceId || !chosenNumber) {
          socket.emit('omiyage:error', { error: 'Missing choiceId or chosenNumber' });
          return;
        }
        
        const resolveResult = await omiyageService.resolveChoice(choiceId, chosenNumber);
        
        if (resolveResult.alreadyResolved) {
          console.log(`[Omiyage] Choice ${choiceId} already resolved, status: ${resolveResult.status}`);
          if (resolveResult.status === 'fulfilled') {
            socket.emit('omiyage:fulfilled', { choiceId, alreadyFulfilled: true });
            return;
          }
        }
        
        const fulfilResult = await omiyageService.fulfilOmiyage(choiceId, socket.ownedCharacterId);
        
        const narrative = await omiyageService.buildFulfilmentNarrative(fulfilResult.object);
        
        socket.emit('omiyage:fulfilled', {
          choiceId,
          object: fulfilResult.object,
          narrative,
          newInventoryEntryId: fulfilResult.newInventoryEntryId
        });
        
        try {
          await onboardingOrchestrator.transitionTo(
            socket.userId,
            'onboarded',
            { choice_id: choiceId },
            'omiyage_accepted'
          );
        } catch (err) {
          if (err.name === 'OptimisticLockError') {
            console.warn('[Omiyage] Concurrent completion detected (accept)');
          } else if (err.name === 'InvalidTransitionError') {
            console.warn('[Omiyage] User already onboarded (accept)');
          } else {
            throw err;
          }
        }
        
        console.log(`[Omiyage] Fulfilled ${choiceId} - ${fulfilResult.object.object_name} to ${socket.userId}`);
        
      } catch (err) {
        console.error('[Omiyage] accept error:', err);
        socket.emit('omiyage:error', { error: err.message });
      }
    });

    socket.on("omiyage:decline", async (payload) => {
      console.log("[Omiyage] decline received", { user: socket.userId, payload });
      
      try {
        const { choiceId } = payload;
        
        if (!choiceId) {
          socket.emit('omiyage:error', { error: 'Missing choiceId' });
          return;
        }
        
        const narrative = await omiyageService.declineOmiyage(choiceId);
        
        socket.emit('omiyage:declined', {
          choiceId,
          narrative
        });
        
        try {
          await onboardingOrchestrator.transitionTo(
            socket.userId,
            'onboarded',
            { choice_id: choiceId, declined: true },
            'omiyage_declined'
          );
        } catch (err) {
          if (err.name === 'OptimisticLockError') {
            console.warn('[Omiyage] Concurrent completion detected (decline)');
          } else if (err.name === 'InvalidTransitionError') {
            console.warn('[Omiyage] User already onboarded (decline)');
          } else {
            throw err;
          }
        }
        
        console.log(`[Omiyage] Declined ${choiceId} by ${socket.userId}`);
        
      } catch (err) {
        console.error('[Omiyage] decline error:', err);
        socket.emit('omiyage:error', { error: err.message });
      }
    });

    socket.on("omiyage:deferral", async (payload) => {
      console.log("[Omiyage] deferral received", { user: socket.userId, payload });
      
      try {
        await onboardingOrchestrator.transitionTo(
          socket.userId,
          'onboarded',
          { deferred: true },
          'omiyage_deferred_skip_to_onboarded'
        );
        
        socket.emit('omiyage:deferred', {
          choiceId: payload.choiceId
        });
        
        console.log(`[Omiyage] Deferred by ${socket.userId}, advanced to onboarded`);
        
      } catch (err) {
        if (err.name === 'OptimisticLockError') {
          console.warn('[Omiyage] Concurrent deferral detected');
        } else if (err.name === 'InvalidTransitionError') {
          console.warn('[Omiyage] User already onboarded (deferral)');
        } else {
          console.error('[Omiyage] deferral error:', err);
        }
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔴 /terminal disconnected: ${socket.username}`);
    });
  });

  return io;
}
