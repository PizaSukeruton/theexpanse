import { getCurrentStoryTaskForCharacter } from './backend/storytellingTaskHelper.mjs'

const task = await getCurrentStoryTaskForCharacter('#700002')
console.log('Claude current task:')
console.log(JSON.stringify(task, null, 2))
process.exit(0)
