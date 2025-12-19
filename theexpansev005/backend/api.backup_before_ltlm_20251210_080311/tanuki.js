import express from "express";
import pool from "../db/pool.js";
import generateHexId from "../utils/hexIdGenerator.js";

const router = express.Router();

/**
 * POST /api/tanuki/activate
 * Activates TanukiEngine for a character/user session.
 */
router.post("/activate", async (req, res) => {
    const { activated, phrase, character_id } = req.body;

    try {
        if (!activated) {
            return res.status(400).json({ success: false, msg: "Missing activation flag" });
        }

        const activationId = await generateHexId("tanuki_level_history_id");

        await pool.query(
            `INSERT INTO tanukilevelhistory
                (historyid, characterid, previouslevel, newlevel, delta, triggeredby)
             VALUES ($1, $2, 0, 0, 0, $3)`,
            [
                activationId,
                character_id || "#700002",
                phrase || "manual"
            ]
        );

        await pool.query(
            `INSERT INTO user_tanuki_profile (character_id)
             VALUES ($1)
             ON CONFLICT (character_id) DO NOTHING`,
            [character_id || "#700002"]
        );

        console.log("TanukiEngine activated:", activationId);

        return res.json({
            success: true,
            activation_id: activationId,
            engine: "TanukiEngine",
            message: "Tanuki Mode now active"
        });

    } catch (err) {
        console.error("Tanuki activation failed:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
