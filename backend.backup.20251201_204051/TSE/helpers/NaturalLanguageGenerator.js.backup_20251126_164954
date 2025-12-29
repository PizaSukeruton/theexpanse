// backend/tse/helpers/NaturalLanguageGenerator.js
// Pattern-based natural language generation - NO external AI, NO hardcoded answers

class NaturalLanguageGenerator {
    constructor() {
        this.sentencePatterns = this.buildSentencePatterns();
        this.transitionPhrases = this.buildTransitionPhrases();
        this.toneModifiers = this.buildToneModifiers();
        console.log('[NaturalLanguageGenerator] Initialized');
    }

    buildSentencePatterns() {
        return {
            affirmative: [
                (subject, predicate) => `Yes, ${subject} ${predicate}.`,
                (subject, predicate) => `That's correct—${subject} ${predicate}.`,
                (subject, predicate) => `Indeed, ${subject} ${predicate}.`
            ],
            negative: [
                (subject, predicate) => `No, ${subject} ${predicate}.`,
                (subject, predicate) => `Actually, ${subject} ${predicate}.`,
                (subject, predicate) => `That's not quite right—${subject} ${predicate}.`
            ],
            descriptive: [
                (subject, info) => `${subject} is ${info}.`,
                (subject, info) => `${subject} can be described as ${info}.`,
                (subject, info) => `When it comes to ${subject}, ${info}.`
            ],
            explanatory: [
                (subject, explanation) => `${subject} works by ${explanation}.`,
                (subject, explanation) => `The way ${subject} functions is ${explanation}.`,
                (subject, explanation) => `To understand ${subject}: ${explanation}.`
            ],
            comparative: [
                (subject, comparison) => `${subject} differs in that ${comparison}.`,
                (subject, comparison) => `Unlike others, ${subject} ${comparison}.`,
                (subject, comparison) => `What sets ${subject} apart is ${comparison}.`
            ]
        };
    }

    buildTransitionPhrases() {
        return {
            addition: ['Additionally', 'Furthermore', 'Also', 'Moreover'],
            contrast: ['However', 'On the other hand', 'That said', 'Nevertheless'],
            example: ['For instance', 'As an example', 'To illustrate'],
            conclusion: ['In summary', 'Overall', 'To sum up'],
            elaboration: ['More specifically', 'In particular', 'To elaborate']
        };
    }

    buildToneModifiers() {
        return {
            gentle_supportive: {
                prefixes: ['You might find it interesting that', 'Here is something helpful:', 'Consider this:'],
                softeners: ['perhaps', 'might', 'could be', 'tends to'],
                closers: ['Hope that helps!', 'Let me know if you want to explore more.', 'Take your time with this.']
            },
            factual_clinical: {
                prefixes: ['Data indicates:', 'According to available information:', 'Factually:'],
                softeners: [],
                closers: ['End of response.', 'Further queries accepted.', '']
            },
            exploratory_inviting: {
                prefixes: ['Let us explore together:', 'Here is something curious:', 'Consider exploring:'],
                softeners: ['interestingly', 'curiously', 'notably'],
                closers: ['What aspect interests you most?', 'There is more to discover here.', 'Shall we go deeper?']
            },
            balanced: {
                prefixes: ['', 'Here is what I found:', 'Based on available knowledge:'],
                softeners: ['generally', 'typically', 'usually'],
                closers: ['', 'Feel free to ask more.', '']
            }
        };
    }

    async generate(knowledgeFacts, learningProfile, knowledgeNeeds, query) {
        if (!knowledgeFacts || knowledgeFacts.length === 0) {
            return this.generateUnknownResponse(query, learningProfile);
        }

        const questionType = this.detectQuestionType(query);
        const tone = this.selectTone(learningProfile, knowledgeNeeds);
        const complexity = this.determineComplexity(learningProfile);

        let response = '';

        response += this.generateOpening(tone, questionType);

        const mainContent = this.constructMainContent(
            knowledgeFacts,
            questionType,
            complexity,
            query
        );
        response += mainContent;

        if (knowledgeFacts.length > 1 && complexity !== 'simple') {
            response += this.generateElaboration(knowledgeFacts.slice(1), tone);
        }

        response += this.generateClosing(tone, learningProfile);

        return response.trim();
    }

    detectQuestionType(query) {
        const q = query.toLowerCase().trim();

        if (q.startsWith('is ') || q.startsWith('are ') || q.startsWith('does ') || q.startsWith('do ') || q.startsWith('can ') || q.startsWith('will ') || q.startsWith('has ') || q.startsWith('have ')) {
            return 'yes_no';
        }
        if (q.startsWith('what ')) return 'what';
        if (q.startsWith('how ')) return 'how';
        if (q.startsWith('why ')) return 'why';
        if (q.startsWith('where ')) return 'where';
        if (q.startsWith('when ')) return 'when';
        if (q.startsWith('who ')) return 'who';
        if (q.startsWith('which ')) return 'which';
        if (q.includes(' vs ') || q.includes(' versus ') || q.includes('compare') || q.includes('difference')) {
            return 'comparative';
        }
        if (q.includes('tell me about') || q.includes('explain') || q.includes('describe')) {
            return 'descriptive';
        }

        return 'general';
    }

    selectTone(learningProfile, knowledgeNeeds) {
        if (!learningProfile || !knowledgeNeeds) return 'balanced';

        const emotionalContext = knowledgeNeeds.emotionalContext || 'neutral';

        switch (emotionalContext) {
            case 'reassuring': return 'gentle_supportive';
            case 'detached': return 'factual_clinical';
            case 'gentle': return 'exploratory_inviting';
            default: return 'balanced';
        }
    }

    determineComplexity(learningProfile) {
        if (!learningProfile) return 'moderate';

        const capacity = learningProfile.overallLearningCapacity || 50;

        if (capacity > 70) return 'detailed';
        if (capacity > 40) return 'moderate';
        return 'simple';
    }

    generateOpening(tone, questionType) {
        const toneConfig = this.toneModifiers[tone] || this.toneModifiers.balanced;
        const prefixes = toneConfig.prefixes.filter(p => p.length > 0);

        if (prefixes.length === 0) return '';

        if (questionType === 'yes_no') return '';

        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        return prefix + ' ';
    }

    constructMainContent(knowledgeFacts, questionType, complexity, query) {
        const primaryFact = knowledgeFacts[0];
        const factContent = typeof primaryFact === 'string' ? primaryFact : primaryFact.content || primaryFact.answer || '';

        const subject = this.extractSubject(query);
        const patterns = this.sentencePatterns;

        switch (questionType) {
            case 'yes_no':
                return this.constructYesNoResponse(factContent, subject, patterns);

            case 'what':
            case 'descriptive':
                return this.constructDescriptiveResponse(factContent, subject, patterns, complexity);

            case 'how':
                return this.constructExplanatoryResponse(factContent, subject, patterns);

            case 'why':
                return this.constructReasoningResponse(factContent, subject);

            case 'comparative':
                return this.constructComparativeResponse(factContent, subject, patterns);

            default:
                return this.constructGeneralResponse(factContent, subject, complexity);
        }
    }

    constructYesNoResponse(factContent, subject, patterns) {
        // Extract answer from Q&A format if present
        let cleanContent = factContent;
        if (factContent.includes('A:')) {
            cleanContent = factContent.split('A:')[1].trim();
        }
        
        const contentLower = cleanContent.trim().toLowerCase();
        console.log('[NLG Debug] cleanContent:', cleanContent, '| contentLower:', contentLower, '| isAffirmative:', contentLower.startsWith('yes'));
        const isAffirmative = contentLower.startsWith('yes') || 
                              contentLower === 'true' || 
                              contentLower.includes('is a ') ||
                              contentLower.includes('can ') ||
                              !contentLower.startsWith('no');

        const patternSet = isAffirmative ? patterns.affirmative : patterns.negative;
        const pattern = patternSet[Math.floor(Math.random() * patternSet.length)];

        let predicate = cleanContent.replace(/^(yes|no)[,.]?\s*/i, '').trim();

        if (!predicate || predicate.length < 3) {
            predicate = isAffirmative ? 'that is correct' : 'that is not the case';
        }

        return pattern(subject, predicate);
    }

    constructDescriptiveResponse(factContent, subject, patterns, complexity) {
        const pattern = patterns.descriptive[Math.floor(Math.random() * patterns.descriptive.length)];

        if (complexity === 'simple') {
            const simplified = factContent.split('.')[0];
            return pattern(subject, simplified);
        }

        return pattern(subject, factContent);
    }

    constructExplanatoryResponse(factContent, subject, patterns) {
        const pattern = patterns.explanatory[Math.floor(Math.random() * patterns.explanatory.length)];
        return pattern(subject, factContent);
    }

    constructReasoningResponse(factContent, subject) {
        return `The reason ${subject} ${factContent}`;
    }

    constructComparativeResponse(factContent, subject, patterns) {
        const pattern = patterns.comparative[Math.floor(Math.random() * patterns.comparative.length)];
        return pattern(subject, factContent);
    }

    constructGeneralResponse(factContent, subject, complexity) {
        if (complexity === 'simple') {
            return factContent.split('.')[0] + '.';
        }
        return factContent;
    }

    extractSubject(query) {
        const q = query.toLowerCase().trim();

        const patterns = [
            /^(?:is|are|does|do|can|will|has|have)\s+(.+?)(?:\s+a\s+|\s+an\s+|\s+the\s+|\?|$)/i,
            /^what\s+(?:is|are)\s+(.+?)(?:\?|$)/i,
            /^tell\s+me\s+about\s+(.+?)(?:\?|$)/i,
            /^(?:how|why|where|when)\s+(?:does|do|is|are)\s+(.+?)(?:\s+work|\s+function|\?|$)/i
        ];

        for (const pattern of patterns) {
            const match = query.match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }

        const words = query.replace(/[?.,!]/g, '').split(' ');
        const stopWords = ['is', 'are', 'the', 'a', 'an', 'does', 'do', 'can', 'will', 'what', 'how', 'why', 'where', 'when', 'who', 'which'];
        const meaningful = words.filter(w => !stopWords.includes(w.toLowerCase()));

        return meaningful.slice(0, 2).join(' ') || 'this';
    }

    generateElaboration(additionalFacts, tone) {
        if (additionalFacts.length === 0) return '';

        const transitions = this.transitionPhrases.addition;
        const transition = transitions[Math.floor(Math.random() * transitions.length)];

        const fact = additionalFacts[0];
        const content = typeof fact === 'string' ? fact : fact.content || fact.answer || '';

        return `\n\n${transition}, ${content}`;
    }

    generateClosing(tone, learningProfile) {
        const toneConfig = this.toneModifiers[tone] || this.toneModifiers.balanced;
        const closers = toneConfig.closers.filter(c => c.length > 0);

        if (closers.length === 0) return '';

        if (Math.random() > 0.6) {
            const closer = closers[Math.floor(Math.random() * closers.length)];
            return '\n\n' + closer;
        }

        return '';
    }

    generateUnknownResponse(query, learningProfile) {
        const subject = this.extractSubject(query);
        const tone = learningProfile ? this.selectTone(learningProfile, {}) : 'balanced';

        const responses = {
            gentle_supportive: [
                `I do not have information about ${subject} yet, but I am still learning. Perhaps you could teach me?`,
                `That is an interesting question about ${subject}. I have not learned about that yet.`,
                `I am not sure about ${subject} at the moment. Would you like to help me understand?`
            ],
            factual_clinical: [
                `No data available for: ${subject}.`,
                `Query regarding ${subject} returned no results.`,
                `Information on ${subject} not found in knowledge base.`
            ],
            exploratory_inviting: [
                `${subject} is something I have not explored yet. Shall we discover it together?`,
                `I am curious about ${subject} too, but I do not have that knowledge yet.`,
                `That is a fascinating question about ${subject}. I have not encountered that information.`
            ],
            balanced: [
                `I do not have information about ${subject} yet.`,
                `I am not able to answer that about ${subject} at this time.`,
                `My knowledge about ${subject} is limited. I am still learning.`
            ]
        };

        const options = responses[tone] || responses.balanced;
        return options[Math.floor(Math.random() * options.length)];
    }
}

export default NaturalLanguageGenerator;
