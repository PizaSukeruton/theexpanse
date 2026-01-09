import TanukiTemplates from "./TanukiTemplates.js";
import VocabularySelector from "./VocabularySelector.js";
import ForbiddenWordScrubber from "./ForbiddenWordScrubber.js";
import RealityGrounder, { generateGroundedStatement } from "./RealityGrounder.js";
import RelationshipGrounder, { generateRelationshipStatement } from "./RelationshipGrounder.js";
import EventGrounder, { generateEventStatement } from "./EventGrounder.js";

export default class ResponseAssembler {
  constructor() {
    this.selector = new VocabularySelector();
    this.scrubber = new ForbiddenWordScrubber();
    this.templates = new TanukiTemplates();
    this.grounder = new RealityGrounder();
    this.relationshipGrounder = new RelationshipGrounder();
    this.eventGrounder = new EventGrounder();
  }

  assemble(inputText, vocab, tanukiLevel, groundedContext, relationshipContext, eventContext) {
    const templateList = this.templates.getTemplate(tanukiLevel) || [];

    // 🔒 Deterministic candidate exposure (LTLM insertion point)
    const candidates = templateList.map(template => ({
      template,
      source: "tanuki_template",
      category: "TEMPLATE"
    }));

    // Placeholder selection (LTLM will replace this)
    const chosen = candidates[0] || {
      template: "${grounded} ${relationships} ${events} ${input}"
    };

    const groundedStatement =
      groundedContext && groundedContext.groundedReality
        ? generateGroundedStatement(groundedContext)
        : "";

    const relationshipStatement =
      relationshipContext && relationshipContext.groundedRelationships
        ? generateRelationshipStatement(relationshipContext)
        : "";

    const eventStatement =
      eventContext && eventContext.groundedEvents
        ? generateEventStatement(eventContext)
        : "";

    const grounded = groundedStatement || "";
    const relationships = relationshipStatement || "";
    const events = eventStatement || "";

    const word1 = this.selector.getTanukiWord(vocab)?.word || "";
    const word2 = this.selector.getDefaultWord(vocab)?.word || "";
    const pairObj = this.selector.getParadoxPair(vocab) || {};
    const pair =
      pairObj.left && pairObj.right
        ? `${pairObj.left} meets ${pairObj.right} — ${pairObj.resolution || "connection"}`
        : "";

    let finalText = chosen.template
      .replace("${grounded}", grounded)
      .replace("${relationships}", relationships)
      .replace("${events}", events)
      .replace("${input}", inputText)
      .replace("${word1}", word1)
      .replace("${word2}", word2)
      .replace("${pair}", pair);

    const forbiddenWords = this.selector.getForbiddenWords(vocab) || [];
    finalText = this.scrubber.scrub(finalText, forbiddenWords);

    return finalText;
  }
}
