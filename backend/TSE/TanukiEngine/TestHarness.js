import MechanicalBrain_v2 from "./MechanicalBrain_v2.js";
import TriggerPhraseDetector from "./TriggerPhraseDetector.js";

async function runHarness() {
  const inputText = process.argv.slice(2).join(" ") || "test input";

  console.log("========================================");
  console.log("🧪 TanukiEngine Test Harness with Triggers");
  console.log("Input:", inputText);
  console.log("----------------------------------------");

  try {
    const detector = new TriggerPhraseDetector();
    const triggerResult = detector.detect(inputText);

    if (!triggerResult.matched) {
      console.log("No trigger phrase detected.");
      console.log("Try: 'Tanuki Mode! what is this?'");
      return;
    }

    console.log("✓ Trigger matched:", triggerResult.character);
    console.log("Character ID:", triggerResult.characterId);
    console.log("Cleaned input:", triggerResult.cleanedInput);
    console.log("----------------------------------------");

    const MechanicalBrain = new MechanicalBrain_v2();
    const output = await MechanicalBrain.generateResponse(
      triggerResult.cleanedInput,
      triggerResult.characterId
    );

    console.log("Final Output:");
    console.log(output);

  } catch (err) {
    console.error("\n🔥 ERROR:");
    console.error(err);
  }

  console.log("========================================");
}

runHarness();
