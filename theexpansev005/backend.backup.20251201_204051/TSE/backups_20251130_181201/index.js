import express from "express";
import TSELoopManager from "./TSELoopManager.js";

const router = express.Router();
export const tseManager = new TSELoopManager();

/*
|--------------------------------------------------------------------------
| KNOWLEDGE ACQUISITION
|--------------------------------------------------------------------------
*/
router.post("/cycle/knowledge", async (req, res) => {
    try {
        const { characterId, query } = req.body;
        const result = await tseManager.startKnowledgeCycle(characterId, query);
        return res.json(result);
    } catch (err) {
        console.error("[TSE API] Knowledge cycle error:", err);
        return res.status(500).json({ error: err.message });
    }
});

/*
|--------------------------------------------------------------------------
| KNOWLEDGE REVIEW  (FSRS review event)
|--------------------------------------------------------------------------
*/
router.post("/review", async (req, res) => {
    try {
        const { characterId, knowledgeId, grade } = req.body;

        if (!characterId || !knowledgeId || grade === undefined) {
            return res.status(400).json({
                error: "characterId, knowledgeId, and grade are required"
            });
        }

        const result = await tseManager.reviewKnowledge(
            characterId,
            knowledgeId,
            grade
        );

        return res.json({
            status: "ok",
            message: "Knowledge reviewed",
            data: result
        });

    } catch (err) {
        console.error("[TSE API] Review error:", err);
        return res.status(500).json({ error: err.message });
    }
});

export default router;
