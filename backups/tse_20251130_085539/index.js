import express from "express";
import TSELoopManager from "./TSELoopManager.js";

const router = express.Router();

export const tseManager = new TSELoopManager();

// ❌ Removed: await tseManager.initialize();

router.post("/cycle/knowledge", async (req, res) => {
    try {
        const { characterId, query } = req.body;
        const result = await tseManager.startKnowledgeCycle(characterId, query);
        res.json(result);
    } catch (err) {
        console.error("[TSE API] Knowledge cycle error:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
