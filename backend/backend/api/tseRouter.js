

























import express from "express";


const router = express.Router();

router.post("/session", async (req, res) => {
  try {
    const { characterId, query, taskCount } = req.body;
    if (!characterId || !query) {
      return res.status(400).json({ error: "characterId and query are required" });
    }

    const session = await tseManager.runTseSession(characterId, query, taskCount || 3);
    return res.json({ status: "ok", session });
  } catch (err) {
    console.error("[TSE API] Session error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
