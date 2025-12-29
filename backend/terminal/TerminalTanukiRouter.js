import cotwIntentMatcher from "../councilTerminal/cotwIntentMatcher.js";
import MechanicalBrain_v2 from "../TSE/TanukiEngine/MechanicalBrain_v2.js";

const brain = new MechanicalBrain_v2();

export async function handleTerminalTanukiQuestion(rawText, characterId = "#700002") {
  const intent = await cotwIntentMatcher.matchIntent(rawText, null, null, null);
  const answer = await brain.generateResponse(rawText, characterId, intent, {}, null, null);
  return { intent, answer };
}
