import KnowledgeAcquisitionEngine from "./helpers/KnowledgeAcquisitionEngine.js";
import LearningDatabase from "./LearningDatabase.js";
import TeacherComponent from "./TeacherComponent.js";
import StudentComponent from "./StudentComponent.js";

export default class TSELoopManager {
    constructor(pool) {
        this.learningDB = new LearningDatabase(pool);
        this.teacher = new TeacherComponent();
        this.student = new StudentComponent();
        this.knowledgeEngine = new KnowledgeAcquisitionEngine();
    }

    async startKnowledgeCycle(characterId, query) {
        // 🔥 Acquire full knowledge object
        const acquired = await this.knowledgeEngine.acquire(characterId, query, { rawQuery: query });

        // 🔥 Create knowledge item in DB (FULL OBJECT)
        const knowledgeRecord = await this.learningDB.createCycle({
            characterId,
            content: acquired.content,
            concept: acquired.concept,
            domainId: acquired.domainId,
            sourceType: acquired.sourceType
        });

        return {
            status: "ok",
            message: "Knowledge cycle created",
            knowledge: knowledgeRecord
        };
    }
}
