import { handleTerminalTanukiQuestion } from "./TerminalTanukiRouter.js";

export async function handleTerminalMessage(rawText, ws, characterId = "#700002") {
  const { intent, answer } = await handleTerminalTanukiQuestion(rawText, characterId);
  const payload = {
    type: "GOD_MODE_RESPONSE",
    intent,
    answer
  };
  ws.send(JSON.stringify(payload));
}
