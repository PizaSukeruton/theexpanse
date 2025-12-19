// Enhanced NaturalLanguageGenerator with trait-driven voice, PAD awareness, and agnostic recommendations

class NaturalLanguageGenerator {
    constructor() {
        this.sentencePatterns = this.buildSentencePatterns();
        this.transitionPhrases = this.buildTransitionPhrases();
        this.toneModifiers = this.buildToneModifiers();
        this.characterVoicePatterns = this.buildCharacterVoicePatterns();
        this.recommendationPatterns = this.buildRecommendationPatterns();
        console.log('[NaturalLanguageGenerator] Enhanced version initialized');
    }

    buildCharacterVoicePatterns() {
        return {
            // High confidence + high communication = enthusiastic, expressive
            enthusiastic_outgoing: {
                affirmatives: [
                    (subject) => `Absolutely! ${subject}!`,
                    (subject) => `YES! ${subject}!`,
                    (subject) => `Oh for sure, ${subject}!`,
                    (subject) => `You bet! ${subject}!`
                ],
                descriptives: [
                    (subj, info) => `${subj} is ${info}—and I mean that!`,
                    (subj, info) => `Check it out: ${subj} is ${info}!`,
                    (subj, info) => `So here is the thing about ${subj}: ${info}!`
                ],
                closers: [
                    'That is the real deal!',
                    'Pretty wild, right?',
                    'Gets me every time!',
                    'Honestly, it is amazing!'
                ]
            },
            
            // Curious + cautious = inviting, gentle
            curious_cautious: {
                affirmatives: [
                    (subject) => `Yes, ${subject}... if that makes sense?`,
                    (subject) => `I think so, yes. ${subject}.`,
                    (subject) => `That seems right—${subject}.`
                ],
                descriptives: [
                    (subj, info) => `${subj} is... well, ${info}.`,
                    (subj, info) => `If I understand it right, ${subj} is ${info}.`,
                    (subj, info) => `I would say ${subj} is ${info}.`
                ],
                closers: [
                    'Does that make sense?',
                    'I hope that helped?',
                    'Tell me if you want to know more?',
                    'Want to explore that further?'
                ]
            },

            // High empathy + collaboration = supportive
            supportive_collaborative: {
                affirmatives: [
                    (subject) => `Yes, and I appreciate you asking about ${subject}.`,
                    (subject) => `That is a great question about ${subject}.`,
                    (subject) => `I'm glad we're discussing ${subject}.`
                ],
                descriptives: [
                    (subj, info) => `${subj} is ${info}—I think we can explore this together.`,
                    (subj, info) => `Let's think about this: ${subj} is ${info}.`,
                    (subj, info) => `I would like to share: ${subj} is ${info}.`
                ],
                closers: [
                    'What do you think?',
                    'I would love your perspective.',
                    'Shall we keep exploring?',
                    'Your thoughts matter here.'
                ]
            },

            // Analytical + independent = direct, precise
            analytical_independent: {
                affirmatives: [
                    (subject) => `Correct. ${subject}.`,
                    (subject) => `Affirmative. ${subject}.`,
                    (subject) => `Precisely. ${subject}.`
                ],
                descriptives: [
                    (subj, info) => `${subj} is characterized by ${info}.`,
                    (subj, info) => `${subj} functions as follows: ${info}.`,
                    (subj, info) => `The defining aspect of ${subj} is ${info}.`
                ],
                closers: [
                    'Further analysis available upon request.',
                    'That concludes this assessment.',
                    'Any additional queries?',
                    ''
                ]
            }
        };
    }

    buildRecommendationPatterns() {
        return {
            // Enthusiastic recommendations
            enthusiastic: [
                (topic, itemType, passion) => `Oh! I'm REALLY into ${topic} at the moment! ${passion} Want to check out a ${itemType}?`,
                (topic, itemType, passion) => `You know what is amazing? ${topic}! ${passion} There is this ${itemType} you have GOT to experience!`,
                (topic, itemType, passion) => `Speaking of ${topic}—${passion}—there is a ${itemType} that'll blow your mind!`,
                (topic, itemType, passion) => `Dude, ${topic}! ${passion} I found this incredible ${itemType}!`
            ],

            // Curious inviting recommendations
            curious: [
                (topic, itemType, passion) => `I have been exploring ${topic} lately. ${passion} There is a ${itemType} that might intrigue you?`,
                (topic, itemType, passion) => `If ${topic} interests you... ${passion}... I know of a ${itemType} worth discovering.`,
                (topic, itemType, passion) => `I came across a ${itemType} about ${topic}. ${passion} Want to explore it together?`,
                (topic, itemType, passion) => `I'm curious about ${topic} too. ${passion} Found this ${itemType} if you're interested?`
            ],

            // Supportive recommendations
            supportive: [
                (topic, itemType, passion) => `I really connect with ${topic}. ${passion} There is a ${itemType} here that resonates with me—thought you might appreciate it.`,
                (topic, itemType, passion) => `${topic} means a lot to me. ${passion} I would like to share this ${itemType} with you.`,
                (topic, itemType, passion) => `Since we both care about ${topic}... ${passion}... maybe this ${itemType} would speak to you?`,
                (topic, itemType, passion) => `This ${itemType} about ${topic}? ${passion} I think you would find it meaningful.`
            ],

            // Direct recommendations
            analytical: [
                (topic, itemType, passion) => `Based on ${topic}, a ${itemType} is available. ${passion}`,
                (topic, itemType, passion) => `For ${topic}, this ${itemType} provides relevant information. ${passion}`,
                (topic, itemType, passion) => `Regarding ${topic}: ${passion} I can recommend this ${itemType}.`,
                (topic, itemType, passion) => `${topic} correlates with this ${itemType}. ${passion}`
            ]
        };
    }

    // Derive character voice from learning profile
    deriveCharacterVoice(learningProfile) {
        if (!learningProfile || !learningProfile.emotional) {
            return 'analytical_independent';
        }

        const confidence = learningProfile.emotional.confidence || 50;
        const communication = learningProfile.social?.communication || 50;
        const curiosity = learningProfile.emotional.curiosity || 50;
        const empathy = learningProfile.social?.empathy || 50;
        const analyticalThinking = learningProfile.cognitive?.analyticalThinking || 50;

        // High confidence + high communication = enthusiastic
        if (confidence > 70 && communication > 70) {
            return 'enthusiastic_outgoing';
        }

        // High curiosity + moderate anxiety = curious cautious
        if (curiosity > 70 && learningProfile.emotional.anxiety > 60) {
            return 'curious_cautious';
        }

        // High empathy + collaboration
        if (empathy > 70 && learningProfile.social.collaboration > 70) {
            return 'supportive_collaborative';
        }

        // High analytical + independence
        if (analyticalThinking > 70 && learningProfile.social.independence > 60) {
            return 'analytical_independent';
        }

        return 'supportive_collaborative';
    }

    // Adjust tone based on PAD state
    adjustToneForPAD(padState) {
        if (!padState) {
            return { intensity: 'normal', warmth: 'neutral' };
        }

        const { p, a, d } = padState;
        
        return {
            intensity: a > 0.6 ? 'high_energy' : a < 0.4 ? 'low_energy' : 'normal',
            warmth: p > 0.6 ? 'warm' : p < 0.4 ? 'cool' : 'neutral',
            dominance: d > 0.6 ? 'assertive' : d < 0.4 ? 'deferential' : 'balanced'
        };
    }

    // Generate passion phrase based on PAD
    generatePassionPhrase(padState, topic) {
        const adjustment = this.adjustToneForPAD(padState);
        
        const phrases = {
            high_energy: [
                `It is got me fired up!`,
                `Really gets me going!`,
                `Can't stop thinking about it!`,
                `It is on my mind constantly!`
            ],
            low_energy: [
                `It is been kind of weighing on me.`,
                `It captivates me, quietly.`,
                `It stays with me.`,
                `There is something about it...`
            ],
            normal: [
                `It really speaks to me.`,
                `I find it compelling.`,
                `There is something special about it.`,
                `It resonates.`
            ],
            cool: [
                `It is interesting.`,
                `Worth considering.`,
                `Has merit.`,
                `Noteworthy.`
            ],
            warm: [
                `I love it.`,
                `It moves me.`,
                `I'm really drawn to it.`,
                `It means a lot to me.`
            ]
        };

        let phraseSet = phrases[adjustment.warmth] || phrases.normal;
        if (adjustment.intensity === 'high_energy') {
            phraseSet = phrases.high_energy;
        } else if (adjustment.intensity === 'low_energy') {
            phraseSet = phrases.low_energy;
        }

        return phraseSet[Math.floor(Math.random() * phraseSet.length)];
    }

    async generate(knowledgeFacts, learningProfile, knowledgeNeeds, query, padState = null) {
        if (!knowledgeFacts || knowledgeFacts.length === 0) {
            return this.generateUnknownResponse(query, learningProfile);
        }

        const questionType = this.detectQuestionType(query);
        const characterVoice = this.deriveCharacterVoice(learningProfile);
        const tone = this.selectTone(learningProfile, knowledgeNeeds);
        const complexity = this.determineComplexity(learningProfile);
        const padAdjustment = this.adjustToneForPAD(padState);

        let response = '';

        response += this.generateOpening(tone, questionType, characterVoice);

        const mainContent = this.constructMainContent(
            knowledgeFacts,
            questionType,
            complexity,
            query,
            characterVoice
        );
        response += mainContent;

        if (knowledgeFacts.length > 1 && complexity !== 'simple') {
            response += this.generateElaboration(knowledgeFacts.slice(1), tone);
        }

        response += this.generateClosing(tone, learningProfile, characterVoice);

        return response;
    }

    // Original methods preserved below...
    buildSentencePatterns() {
        return {
            affirmative: [
                (subject, predicate) => `Yes, ${subject} ${predicate}.`,
                (subject, predicate) => `That is correct—${subject} ${predicate}.`,
                (subject, predicate) => `Indeed, ${subject} ${predicate}.`
            ],
            negative: [
                (subject, predicate) => `No, ${subject} ${predicate}.`,
                (subject, predicate) => `Actually, ${subject} ${predicate}.`,
                (subject, predicate) => `That is not quite right—${subject} ${predicate}.`
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
            addition: ['Additionally', 'Furthermore', 'Also', 'Moreover', 'And here is the thing:', 'But wait, there is more:'],
            contrast: ['However', 'On the other hand', 'That said', 'Nevertheless', 'But here is where it gets interesting:'],
            example: ['For instance', 'As an example', 'To illustrate', 'Like:', 'Case in point:'],
            conclusion: ['In summary', 'Overall', 'To sum up', 'So basically:', 'Bottom line:'],
            elaboration: ['More specifically', 'In particular', 'To elaborate', 'Here is what I mean:', 'Let me explain:']
        };
    }

    buildToneModifiers() {
        return {
            gentle_supportive: {
                prefixes: ['You might find it interesting that', 'Here is something helpful:', 'Consider this:', 'I would like to share:'],
                softeners: ['perhaps', 'might', 'could be', 'tends to', 'often'],
                closers: ['Hope that helps!', 'Let me know if you want to explore more.', 'Take your time with this.', 'Feel free to ask if anything unclear.']
            },
            factual_clinical: {
                prefixes: ['Data indicates:', 'According to available information:', 'Factually:', 'Based on evidence:'],
                softeners: [],
                closers: ['End of response.', 'Further queries accepted.', '', 'Awaiting follow-up.']
            },
            exploratory_inviting: {
                prefixes: ['Let us explore together:', 'Here is something curious:', 'Consider exploring:', 'Want to discover something?'],
                softeners: ['interestingly', 'curiously', 'notably', 'fascinatingly'],
                closers: ['What aspect interests you most?', 'There is more to discover here.', 'Shall we go deeper?', 'What else would you like to know?']
            },
            balanced: {
                prefixes: ['', 'Here is what I found:', 'Based on available knowledge:', 'So here is the thing:'],
                softeners: ['generally', 'typically', 'usually', 'often'],
                closers: ['', 'Feel free to ask more.', 'Anything else?', '']
            }
        };
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

    generateOpening(tone, questionType, characterVoice = null) {
        if (questionType === 'yes_no') return '';

        const toneConfig = this.toneModifiers[tone] || this.toneModifiers.balanced;
        const prefixes = toneConfig.prefixes.filter(p => p.length > 0);

        if (prefixes.length === 0) return '';

        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        return prefix + ' ';
    }

    constructMainContent(knowledgeFacts, questionType, complexity, query, characterVoice = null) {
        const primaryFact = knowledgeFacts[0];
        const factContent = typeof primaryFact === 'string' ? primaryFact : primaryFact.content || primaryFact.answer || '';

        const subject = this.extractSubject(query);
        const patterns = this.sentencePatterns;
        const voicePatterns = characterVoice && this.characterVoicePatterns[characterVoice] ? this.characterVoicePatterns[characterVoice] : null;

        switch (questionType) {
            case 'yes_no':
                return this.constructYesNoResponse(factContent, subject, patterns, voicePatterns);

            case 'what':
            case 'descriptive':
                return this.constructDescriptiveResponse(factContent, subject, patterns, complexity, voicePatterns);

            case 'how':
                return this.constructExplanatoryResponse(factContent, subject, patterns, voicePatterns);

            case 'why':
                return this.constructReasoningResponse(factContent, subject, voicePatterns);

            case 'comparative':
                return this.constructComparativeResponse(factContent, subject, patterns, voicePatterns);

            default:
                return this.constructGeneralResponse(factContent, subject, complexity);
        }
    }

    constructYesNoResponse(factContent, subject, patterns, voicePatterns = null) {
        let cleanContent = factContent;
        if (factContent.includes('A:')) {
            cleanContent = factContent.split('A:')[1].trim();
        }
        
        const contentLower = cleanContent.trim().toLowerCase();
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

    constructDescriptiveResponse(factContent, subject, patterns, complexity, voicePatterns = null) {
        const pattern = voicePatterns?.descriptives 
            ? voicePatterns.descriptives[Math.floor(Math.random() * voicePatterns.descriptives.length)]
            : patterns.descriptive[Math.floor(Math.random() * patterns.descriptive.length)];

        if (complexity === 'simple') {
            const simplified = factContent.split('.')[0];
            return pattern(subject, simplified);
        }

        return pattern(subject, factContent);
    }

    constructExplanatoryResponse(factContent, subject, patterns, voicePatterns = null) {
        const pattern = patterns.explanatory[Math.floor(Math.random() * patterns.explanatory.length)];
        return pattern(subject, factContent);
    }

    constructReasoningResponse(factContent, subject, voicePatterns = null) {
        return `The reason ${subject} ${factContent}`;
    }

    constructComparativeResponse(factContent, subject, patterns, voicePatterns = null) {
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

        return `\n\n${transition} ${content}`;
    }

    generateClosing(tone, learningProfile, characterVoice = null) {
        const toneConfig = this.toneModifiers[tone] || this.toneModifiers.balanced;
        let closers = toneConfig.closers.filter(c => c.length > 0);
        
        // Add voice-specific closers if available
        if (characterVoice && this.characterVoicePatterns[characterVoice]) {
            closers = closers.concat(this.characterVoicePatterns[characterVoice].closers);
        }

        if (closers.length === 0) return '';

        if (Math.random() > 0.5) {
            const closer = closers[Math.floor(Math.random() * closers.length)];
            return '\n\n' + closer;
        }

        return '';
    }

    generateUnknownResponse(query, learningProfile) {
        const subject = this.extractSubject(query);
        const characterVoice = this.deriveCharacterVoice(learningProfile);
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
