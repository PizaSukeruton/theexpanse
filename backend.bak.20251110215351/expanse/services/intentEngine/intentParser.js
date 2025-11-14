export default {
  parseIntent: async function (inputText) {
    const text = (inputText || '').trim().toLowerCase()
    let type = null

    if (text.startsWith('who ')) type = 'who'
    else if (text.startsWith('what ')) type = 'what'
    else if (text.startsWith('when ')) type = 'when'
    else if (text.startsWith('where ')) type = 'where'
    else if (text.startsWith('why ')) type = 'why'
    else if (text.startsWith('how ')) type = 'how'
    // Support “who is”, “what are”, “when did”, etc.
    else if (/^who\s+(is|are|was|were)/.test(text)) type = 'who'
    else if (/^what\s+(is|are|was|were|does|do|did)/.test(text)) type = 'what'
    else if (/^when\s+(is|was|were|did|do)/.test(text)) type = 'when'
    else if (/^where\s+(is|are|was|were)/.test(text)) type = 'where'
    else if (/^why\s+(is|are|was|were|did|do)/.test(text)) type = 'why'
    else if (/^how\s+(is|are|was|were|did|do)/.test(text)) type = 'how'

    return {
      questionType: type,
      entities: [],
      raw: inputText
    }
  }
}
