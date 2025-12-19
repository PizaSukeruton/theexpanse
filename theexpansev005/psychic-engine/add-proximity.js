import pool from '../backend/db/pool.js'
import generateHexId from '../backend/utils/hexIdGenerator.js'

async function addProximity(charA, charB, distance, resonance) {
  const proximityId = await generateHexId('domain_id')
  
  await pool.query(
    `INSERT INTO psychic_proximity 
     (proximity_id, character_a, character_b, psychological_distance, emotional_resonance, last_interaction)
     VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
     ON CONFLICT (character_a, character_b) 
     DO UPDATE SET 
       psychological_distance = $4,
       emotional_resonance = $5,
       last_interaction = CURRENT_TIMESTAMP`,
    [proximityId, charA, charB, distance, resonance]
  )
  console.log(`Proximity ${proximityId} created between ${charA} and ${charB}`)
  process.exit(0)
}

const [charA, charB, distance, resonance] = process.argv.slice(2)
addProximity(charA, charB, parseFloat(distance), parseFloat(resonance))
