import generateHexId from './backend/utils/hexIdGenerator.js'
import pool from './backend/db/pool.js'

const newId = await generateHexId('stateid')
console.log('New state ID:', newId)
await pool.end()
