class AccuracyScorer {
    constructor() {
        this.stopWords = new Set([
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
            'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
            'to', 'was', 'will', 'with'
        ]);
    }

    async evaluateResponse(response, aokSources, deliveryStyle, characterTraits) {
        const pillar1 = await this.groundTruthAlignment(response, aokSources);
        const pillar2 = this.coverageRelevance(response, aokSources);
        const pillar3 = this.contradictionCheck(response, aokSources);
        const pillar4 = this.styleFit(response, deliveryStyle, characterTraits);

        const overall = (
            pillar1 * 0.40 +
            pillar2 * 0.25 +
            pillar3 * 0.20 +
            pillar4 * 0.15
        );

        return {
            groundTruthAlignment: Math.round(pillar1),
            coverageRelevance: Math.round(pillar2),
            contradictionCheck: Math.round(pillar3),
            styleFit: Math.round(pillar4),
            overallAccuracy: Math.round(overall),
            breakdown: {
                pillar1_weight: '40%',
                pillar2_weight: '25%',
                pillar3_weight: '20%',
                pillar4_weight: '15%'
            }
        };
    }

    async groundTruthAlignment(response, aokSources) {
        if (!aokSources || aokSources.length === 0) return 50;

        let totalScore = 0;

        for (const source of aokSources) {
            const sourceContent = (source.content || '').toLowerCase();
            const responseContent = response.toLowerCase();

            const sourceKeywords = this.extractKeywords(sourceContent);
            const responseKeywords = this.extractKeywords(responseContent);

            const matches = sourceKeywords.filter(kw => 
                responseKeywords.includes(kw) || 
                responseContent.includes(kw)
            );

            const matchRate = sourceKeywords.length > 0 
                ? matches.length / sourceKeywords.length 
                : 0;

            totalScore += matchRate * 100;
        }

        const avgScore = aokSources.length > 0 
            ? totalScore / aokSources.length 
            : 50;

        return Math.min(100, Math.max(0, avgScore));
    }

    coverageRelevance(response, aokSources) {
        if (!aokSources || aokSources.length === 0) return 50;

        const allSourceKeywords = new Set();
        aokSources.forEach(source => {
            const keywords = this.extractKeywords((source.content || '').toLowerCase());
            keywords.forEach(kw => allSourceKeywords.add(kw));
        });

        const responseKeywords = this.extractKeywords(response.toLowerCase());
        const coveredKeywords = [...allSourceKeywords].filter(kw => 
            responseKeywords.includes(kw) || 
            response.toLowerCase().includes(kw)
        );

        const coverageRate = allSourceKeywords.size > 0
            ? coveredKeywords.length / allSourceKeywords.size
            : 0.5;

        return Math.round(coverageRate * 100);
    }

    contradictionCheck(response, aokSources) {
        if (!aokSources || aokSources.length === 0) return 100;

        const contradictionWords = [
            'not', 'never', 'cannot', 'can\'t', 'won\'t', 'don\'t', 'doesn\'t',
            'no', 'none', 'neither', 'nor', 'nothing', 'nowhere', 'nobody',
            'isn\'t', 'aren\'t', 'wasn\'t', 'weren\'t', 'hasn\'t', 'haven\'t',
            'incorrect', 'false', 'wrong', 'untrue', 'impossible'
        ];

        const responseLower = response.toLowerCase();
        let contradictionPenalty = 0;

        for (const source of aokSources) {
            const sourceKeywords = this.extractKeywords((source.content || '').toLowerCase());

            for (const keyword of sourceKeywords) {
                for (const contradictionWord of contradictionWords) {
                    const pattern = new RegExp(`${contradictionWord}\\s+\\w*\\s*${keyword}`, 'i');
                    const reversePattern = new RegExp(`${keyword}\\s+\\w*\\s*${contradictionWord}`, 'i');
                    
                    if (pattern.test(responseLower) || reversePattern.test(responseLower)) {
                        contradictionPenalty += 30;
                        console.log(`[AccuracyScorer] Contradiction detected: "${contradictionWord}" near "${keyword}"`);
                    }
                }
            }
        }

        const score = Math.max(0, 100 - contradictionPenalty);
        return score;
    }

    styleFit(response, deliveryStyle, characterTraits) {
        if (!deliveryStyle) return 50;

        const styleRequirements = {
            exploratory_inviting: {
                required: ['consider', 'explore', 'might', 'perhaps', 'could'],
                forbidden: ['must', 'always', 'never', 'definitely'],
                tone: 'gentle'
            },
            factual_clinical: {
                required: ['is', 'are', 'defined', 'consists'],
                forbidden: ['maybe', 'perhaps', 'might', 'feel'],
                tone: 'direct'
            },
            gentle_supportive: {
                required: ['you', 'can', 'help', 'together', 'support'],
                forbidden: ['wrong', 'incorrect', 'failed', 'bad'],
                tone: 'warm'
            },
            direct_confident: {
                required: ['clear', 'specific', 'precise', 'exactly'],
                forbidden: ['maybe', 'perhaps', 'unclear', 'confused'],
                tone: 'assertive'
            },
            adaptive_flexible: {
                required: ['adapt', 'adjust', 'consider', 'depends'],
                forbidden: ['always', 'never', 'only', 'must'],
                tone: 'balanced'
            },
            socratic_questioning: {
                required: ['?', 'what', 'how', 'why', 'consider'],
                forbidden: ['here is', 'the answer', 'simply', 'just'],
                tone: 'inquisitive'
            }
        };

        const requirements = styleRequirements[deliveryStyle] || styleRequirements.adaptive_flexible;
        const responseLower = response.toLowerCase();

        let score = 70;

        const requiredMatches = requirements.required.filter(word => 
            responseLower.includes(word)
        ).length;
        score += (requiredMatches / requirements.required.length) * 20;

        const forbiddenMatches = requirements.forbidden.filter(word => 
            responseLower.includes(word)
        ).length;
        score -= (forbiddenMatches / requirements.forbidden.length) * 15;

        if (characterTraits) {
            const anxiety = characterTraits.emotional?.anxiety || 50;
            const confidence = characterTraits.emotional?.confidence || 50;

            if (anxiety > 70 && deliveryStyle === 'gentle_supportive') {
                score += 10;
            }
            if (confidence > 70 && deliveryStyle === 'direct_confident') {
                score += 10;
            }
        }

        return Math.min(100, Math.max(0, Math.round(score)));
    }

    extractKeywords(text) {
        if (!text || typeof text !== 'string') return [];

        const words = text
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .map(w => w.toLowerCase())
            .filter(w => w.length > 2)
            .filter(w => !this.stopWords.has(w));

        return [...new Set(words)];
    }
}

export default AccuracyScorer;
