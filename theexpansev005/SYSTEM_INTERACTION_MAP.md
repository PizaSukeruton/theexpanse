# System Interaction Map (Expanse V005)

## Message flow

- CMS terminal (`cms/js/cmsSocketHandler.js`, `cms/js/socketManager.js`)
  - Sends `terminal-command` / `terminal:command` with `{ command }`.
  - Receives `command-response` / `terminal:response` and renders output, including `welcomeBeat` for first login. [file:1]

- Backend terminal namespace (`backend/councilTerminal/socketHandler.js`)
  - On connect: calls `getFirstLoginWelcomeBeat(userId, userId)` and emits `command-response` with `{ welcome: true, welcomeBeat }` if present.
  - On command: routes messages through `modeRouter` and intent/response pipeline, then emits `command-response` / `terminal:response`. [file:1]

## Intent and mode routing

- `backend/councilTerminal/modeRouter.js`
  - Detects mode (God, Tanuki, standard) from prefixes / patterns. [file:1]

- `backend/councilTerminal/cotwIntentMatcher.js`
  - Normalizes query, strips noise, matches strict/loose intents (`WHO`, `WHAT`, `SEARCH`, `EDIT_PROFILE`, etc.).
  - Resolves entities with `utils/tieredEntitySearch.js` and `utils/entityHelpers.js` by realm (`getRealmFromAccessLevel`). [file:1]

## Narrative arcs and onboarding

- Tables: `narrative_arcs`, `narrative_beats`, `user_arc_state`.
- `backend/services/narrativeWelcomeService.js`
  - Finds latest `onboarding_welcome` arc.
  - Checks/creates `user_arc_state` for entry beat (e.g. `#DF0003` “Welcome Beat 1: Claude Greets”).
  - Returns `welcomeBeat` `{ beatId, arcId, title, contentTemplate, targetPad }`. [file:1]

- `backend/routes/auth.js`
  - Handles login; sets session and calls `upsertDossierForUser(user_id)`.
  - No longer calls `getFirstLoginWelcomeBeat`; welcome is now terminal-only. [file:1]

## Response generation

- `backend/councilTerminal/runStandardQuery.js`
  - Executes the factual/logical part of the request based on intent and entity. [file:1]

- `backend/councilTerminal/MechanicalBrainv2.js`, `backend/councilTerminal/TanukiModeRouter.js`
  - Wrap base answers in narrative style using Tanuki overlays and character state. [file:1]

- LTLM integration
  - Beats provide `content_template.ltlm_*` and `target_pad` for speech act, dialogue function, outcome intent, and PAD targets (e.g. welcome beat).
  - LTLM uses these to generate or steer Claude’s utterances within arcs and modes. [file:1]

## Continuous learning and state

- Traits system
  - Tables: `charactertraits`, `charactertraitscores`.
  - New users/avatars: 270 traits at neutral baseline (e.g. 50%); interactions move these over time. [file:1]

- Psychic / PAD system
  - Tables: `psychicevents`, `psychicframes`, `psychicmoods`.
  - Tracks PAD vectors; events and interactions shift mood. [file:1]

- Knowledge + FSRS/SM2
  - Tables: `learningvocabulary`, `characterknowledgestate`, `knowledgedomains`.
  - Scheduler sets `nextreviewat` to revisit concepts based on performance. [file:1]

- TSE loop
  - Modules: `TSELoopManager.js`, `TeacherRole.js`, `StudentRole.js`, `EvaluatorRole.js`, `BeltProgressionManager.js`.
  - Tables: `tsecycles`, `tsestudentrecords`, `tseevaluationrecords`, `characterbeltprogression`.
  - Converts interactions into learning cycles and belt progression. [file:1]

- User COTW dossier
  - Service: `services/cotwDossierService.js` (`upsertDossierForUser`).
  - Stores per-user preferences, interaction data, and learning profile.
  - Personalization lives here and in user/character-scoped tables, never in `systemconcepts` or other global schema. [file:1]
