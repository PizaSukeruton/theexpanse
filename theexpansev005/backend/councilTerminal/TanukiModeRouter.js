import MechanicalBrain_v2 from "../TSE/TanukiEngine/MechanicalBrain_v2.js";

/**
 * TanukiModeRouter
 * Full Tanuki Chaos (Option C)
 * -----------------------------------------
 * This router:
 * 1. Receives the *normal* query answer.
 * 2. Invokes Claude's MechanicalBrain_v2 to generate a Tanuki Magic layer.
 * 3. Combines them into a single structured response.
 * 
 * Inputs:
 *  - intent          (intent object from matcher)
 *  - user            (session user object)
 *  - command         (cleaned text of user command)
 *  - session         (session context object)
 *  - normalResult    (output of runStandardQuery)
 *
 * Output structure:
 * {
 *   mode: "tanuki",
 *   output: "<combined text>",
 *   chaos: "<tanuki magic>",
 *   baseOutput: "<normal text>",
 *   entityUsed: ...,
 *   entityType: ...,
 *   image: ...
 * }
 */
export default async function TanukiModeRouter(intent, user, command, session, normalResult) {
  try {
    console.log("[TanukiModeRouter] Received normalResult:", normalResult);
    const brain = new MechanicalBrain_v2();

    const tanukiResponse = await brain.generateResponse(
      command,
      "#700002",
      intent,
      session?.context || {}
    );

    const baseOutput = normalResult?.message || normalResult?.output || "I found no clear answer.";
    const chaos = tanukiResponse || "My thoughts shimmer too wildly to answer.";

    const combinedOutput =
      baseOutput +
      "\n\n" +
      "🐾 **Tanuki Magic:**\n" +
      chaos;

    return {
      mode: "tanuki",
      output: combinedOutput,
      chaos,
      baseOutput,
      entityUsed: normalResult?.entityUsed || intent.entity,
      entityType: normalResult?.entityType || "Unknown",
      queryType: intent.type,
      image: normalResult?.image || null
    };

  } catch (err) {
    console.error("[TanukiModeRouter] Error:", err.message);

    const fallback = normalResult?.output || "No response available.";

    return {
      mode: "tanuki",
      output: fallback + "\n\n🐾 Tanuki Magic failed to ignite.",
      error: err.message,
      entityUsed: intent.entity,
      entityType: "Unknown",
      queryType: intent.type,
      image: normalResult?.image || null
    };
  }
}
