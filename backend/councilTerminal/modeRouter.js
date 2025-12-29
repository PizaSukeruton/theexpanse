import cotwIntentMatcher from "./cotwIntentMatcher.js";

async function detectMode(original, accessLevel, session) {
  const input = original.trim().toLowerCase();
  const isAdmin = accessLevel === 11;

  const godPrefixes = ["god mode:", "god:"];
  for (const p of godPrefixes) {
    if (input.startsWith(p)) {
      return {
        mode: isAdmin ? "god" : "normal",
        cleanCommand: original.slice(p.length).trim(),
        original,
        prefixUsed: true,
        intentResult: await cotwIntentMatcher.matchIntent(original.slice(p.length).trim(), null, session)
      };
    }
  }

  const tanukiPrefixes = ["tanuki mode:", "tanuki:", "tm:"];
  for (const p of tanukiPrefixes) {
    if (input.startsWith(p)) {
      return {
        mode: "tanuki",
        cleanCommand: original.slice(p.length).trim(),
        original,
        prefixUsed: true,
        intentResult: await cotwIntentMatcher.matchIntent(original.slice(p.length).trim(), null, session)
      };
    }
  }

  const berzerkerPrefixes = ["berzerker mode:", "berzerker:"];
  for (const p of berzerkerPrefixes) {
    if (input.startsWith(p)) {
      return {
        mode: isAdmin ? "berzerker" : "normal",
        cleanCommand: original.slice(p.length).trim(),
        original,
        prefixUsed: true,
        intentResult: await cotwIntentMatcher.matchIntent(original.slice(p.length).trim(), null, session)
      };
    }
  }

  // Placeholder modes (implementation pending)
  const hefePrefixes = ["hefe mode:", "hefe:"];
  for (const p of hefePrefixes) {
    if (input.startsWith(p)) {
      return {
        mode: "normal",
        cleanCommand: original.slice(p.length).trim(),
        original,
        prefixUsed: true,
        intentResult: await cotwIntentMatcher.matchIntent(original.slice(p.length).trim(), null, session)
      };
    }
  }

  const melvinPrefixes = ["melvin mode:", "melvin:"];
  for (const p of melvinPrefixes) {
    if (input.startsWith(p)) {
      return {
        mode: "normal",
        cleanCommand: original.slice(p.length).trim(),
        original,
        prefixUsed: true,
        intentResult: await cotwIntentMatcher.matchIntent(original.slice(p.length).trim(), null, session)
      };
    }
  }

  const mikePrefixes = ["mike mode:", "mike:"];
  for (const p of mikePrefixes) {
    if (input.startsWith(p)) {
      return {
        mode: "normal",
        cleanCommand: original.slice(p.length).trim(),
        original,
        prefixUsed: true,
        intentResult: await cotwIntentMatcher.matchIntent(original.slice(p.length).trim(), null, session)
      };
    }
  }

  const daniquePrefixes = ["danique mode:", "danique:"];
  for (const p of daniquePrefixes) {
    if (input.startsWith(p)) {
      return {
        mode: "normal",
        cleanCommand: original.slice(p.length).trim(),
        original,
        prefixUsed: true,
        intentResult: await cotwIntentMatcher.matchIntent(original.slice(p.length).trim(), null, session)
      };
    }
  }

  const keisukePrefixes = ["keisuke mode:", "keisuke:"];
  for (const p of keisukePrefixes) {
    if (input.startsWith(p)) {
      return {
        mode: "normal",
        cleanCommand: original.slice(p.length).trim(),
        original,
        prefixUsed: true,
        intentResult: await cotwIntentMatcher.matchIntent(original.slice(p.length).trim(), null, session)
      };
    }
  }

  return {
    mode: "normal",
    cleanCommand: original,
    original,
    prefixUsed: false,
    intentResult: await cotwIntentMatcher.matchIntent(original, null, session)
  };
}

export default { detectMode };
