import KnowledgeResponseEngine from "./helpers/KnowledgeResponseEngine.js";
import NaturalLanguageGenerator from "./helpers/NaturalLanguageGenerator.js";

class TeacherComponent {
  constructor() {
    this.nodeId = Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, "0");
    console.log(`[TSE-Teacher] Initialized with node ID: ${this.nodeId}`);

    this.nlg = new NaturalLanguageGenerator();
    this.responseEngine = new KnowledgeResponseEngine();
  }

  async initialize() {
    console.log("[TSE-Teacher] initialize() called — no-op");
    return true;
  }

  getNodeId() {
    return this.nodeId;
  }

  async teach(characterId, query, context) {
    const result = await this.responseEngine.generate(characterId, query, context);
    return result;
  }
}

export default TeacherComponent;
