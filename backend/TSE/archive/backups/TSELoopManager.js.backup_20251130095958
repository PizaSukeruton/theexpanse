import LearningDatabase from "./LearningDatabase.js";
import KnowledgeAcquisitionEngine from "./helpers/KnowledgeAcquisitionEngine.js";
import KnowledgeResponseEngine from "./helpers/KnowledgeResponseEngine.js";
import pool from "../db/pool.js";

export default class TSELoopManager {
    constructor() {
        this.learningDB = new LearningDatabase(pool);
        this.acquisition = new KnowledgeAcquisitionEngine();
        this.responseEngine = new KnowledgeResponseEngine();
    }

    async startKnowledgeCycle(characterId, query) {
        const acquired = await this.acquisition.acquire(characterId, query);
        return await this.learningDB.createCycle(acquired);
    }

    async reviewKnowledge(characterId, knowledgeId, grade) {
        return await this.learningDB.reviewKnowledge(characterId, knowledgeId, grade);
    }
}
