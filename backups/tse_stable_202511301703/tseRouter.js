import express from "express";
import TSELoopManager from "../TSE/TSELoopManager.js";

const router = express.Router();
// Instantiating a local instance for the API
const tseManager = new TSELoopManager();

// Initialize the manager (loads sub-components)
// Note: In a real prod app, you might want to await this at server startup,
// but for now, we trust the constructor or lazy load.
tseManager.initialize().then(() => console.log("[TSE Router] Manager initialized"));

router.post("/knowledge", async (req, res) => {
  try {
    const { characterId, query } = req.body;
    if (!characterId || !query) {
      return res.status(400).json({ error: "characterId and query are required" });
    }
    
    // Call the newly added alias method
    const result = await tseManager.startKnowledgeCycle(characterId, query);
    return res.json({ status: "ok", data: result });
  } catch (err) {
    console.error("[TSE API] Knowledge error:", err);
    return res.status(500).json({ error: err.message });
  }
});

router.post("/review", async (req, res) => {
  try {
    const { characterId, knowledgeId, grade } = req.body;
    if (!characterId || !knowledgeId || grade === undefined) {
      return res.status(400).json({ error: "characterId, knowledgeId, and grade are required" });
    }
    const result = await tseManager.reviewKnowledge(characterId, knowledgeId, grade);
    return res.json({ status: "ok", data: result });
  } catch (err) {
    console.error("[TSE API] Review error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
