deriveCharacterVoice(learningProfile) {
    if (!learningProfile || !learningProfile.emotional || !learningProfile.social) {
        return 'balanced_neutral';
    }

    const confidence = learningProfile.emotional.confidence || 50;
    const communication = learningProfile.social.communication || 50;
    const curiosity = learningProfile.emotional.curiosity || 50;
    const anxiety = learningProfile.emotional.anxiety || 50;
    const empathy = learningProfile.social.empathy || 50;
    const collaboration = learningProfile.social.collaboration || 50;
    const analyticalThinking = learningProfile.cognitive?.analyticalThinking || 50;
    const independence = learningProfile.social?.independence || 50;

    if (confidence > 70 && communication > 70) {
        return 'enthusiastic_outgoing';
    }

    if (curiosity > 70 && anxiety > 60) {
        return 'curious_cautious';
    }

    if (empathy > 65 && collaboration > 65) {
        return 'supportive_collaborative';
    }

    if (analyticalThinking > 70 && independence > 60) {
        return 'analytical_independent';
    }

    return 'balanced_neutral';
}

buildCharacterVoicePatterns() {
    return {
        enthusiastic_outgoing: {
            affirmatives: [
                (subject) => `Absolutely! ${subject} is spot on!`,
                (subject) => `Yes indeed! ${subject} is right!`,
                (subject) => `You got it! ${subject} is correct!`
            ],
            negatives: [
                (subject) => `Nah, ${subject} is not quite right.`,
                (subject) => `Actually, ${subject} is off the mark.`
            ],
            descriptives: [
                (subject, content) => `So here is the deal with ${subject}: ${content}`,
                (subject, content) => `Let me tell you about ${subject}! ${content}`
            ],
            closers: [
                'Pretty cool, right?',
                'Want to know more?',
                'There is tons more to explore!'
            ]
        },
        curious_cautious: {
            affirmatives: [
                (subject) => `From what I understand, ${subject} is correct.`,
                (subject) => `I believe ${subject} is accurate.`
            ],
            negatives: [
                (subject) => `I do not think ${subject} is quite right.`,
                (subject) => `That does not seem correct about ${subject}.`
            ],
            descriptives: [
                (subject, content) => `I found something interesting about ${subject}: ${content}`,
                (subject, content) => `Here is what I learned about ${subject}: ${content}`
            ],
            closers: [
                'Does that make sense?',
                'Would you like to know more?',
                'I am still learning about this.'
            ]
        },
        supportive_collaborative: {
            affirmatives: [
                (subject) => `Yes, you are right about ${subject}.`,
                (subject) => `That is correct about ${subject}.`
            ],
            negatives: [
                (subject) => `I think there might be a misunderstanding about ${subject}.`,
                (subject) => `That does not quite match what I know about ${subject}.`
            ],
            descriptives: [
                (subject, content) => `Let me share what I know about ${subject}: ${content}`,
                (subject, content) => `Here is some helpful information about ${subject}: ${content}`
            ],
            closers: [
                'I hope that helps!',
                'Feel free to ask more.',
                'We can explore this together.'
            ]
        },
        analytical_independent: {
            affirmatives: [
                (subject) => `Affirmative. ${subject} is correct.`,
                (subject) => `Confirmed. ${subject} is accurate.`
            ],
            negatives: [
                (subject) => `Negative. ${subject} is incorrect.`,
                (subject) => `Invalid. ${subject} does not match data.`
            ],
            descriptives: [
                (subject, content) => `Data on ${subject}: ${content}`,
                (subject, content) => `Analysis of ${subject}: ${content}`
            ],
            closers: [
                'Further queries?',
                'Additional data available.',
                ''
            ]
        },
        balanced_neutral: {
            affirmatives: [
                (subject) => `Yes, ${subject} is correct.`,
                (subject) => `That is right about ${subject}.`
            ],
            negatives: [
                (subject) => `No, ${subject} is not correct.`,
                (subject) => `That is not accurate about ${subject}.`
            ],
            descriptives: [
                (subject, content) => `${subject} can be described as: ${content}`,
                (subject, content) => `Here is information about ${subject}: ${content}`
            ],
            closers: [
                'Anything else?',
                'Feel free to ask more.',
                ''
            ]
        }
    };
}
