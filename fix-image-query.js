// Fix for queryShowImage function
// Replace the existing queryShowImage function with this improved version

async queryShowImage(entity) {
  // First try exact match
  const exactQuery = `
    SELECT character_id, character_name, category, description
    FROM character_profiles 
    WHERE LOWER(character_name) = LOWER($1)
    LIMIT 1
  `;
  
  let result = await pool.query(exactQuery, [entity]);
  
  // If no exact match, try partial match on name only (not description)
  if (result.rows.length === 0) {
    const partialQuery = `
      SELECT character_id, character_name, category, description
      FROM character_profiles 
      WHERE LOWER(character_name) LIKE LOWER($1)
      ORDER BY character_name
      LIMIT 1
    `;
    result = await pool.query(partialQuery, [`%${entity}%`]);
  }
  
  if (result.rows.length > 0) {
    const character = result.rows[0];
    // Generate image path based on character name
    const imageName = character.character_name.toLowerCase().replace(/ /g, '');
    const imagePath = `/gallery/${imageName}.png`;
    
    return {
      type: 'image',
      character: character,
      image: imagePath,
      count: 1
    };
  }
  
  return {
    type: 'image',
    data: [],
    count: 0,
    message: `No image found for "${entity}"`
  };
}

// Also fix queryWho to be more precise
async queryWho(entity) {
  // First try exact match
  const exactQuery = `
    SELECT * FROM character_profiles 
    WHERE LOWER(character_name) = LOWER($1)
  `;
  
  let result = await pool.query(exactQuery, [entity]);
  
  if (result.rows.length > 0) {
    return {
      type: 'characters',
      data: result.rows,
      count: result.rows.length
    };
  }
  
  // If no exact match, search for partial matches in name only
  const nameQuery = `
    SELECT *,
      CASE 
        WHEN LOWER(character_name) = LOWER($1) THEN 200
        WHEN LOWER(character_name) LIKE LOWER($2) THEN 100
        ELSE 50
      END as relevance
    FROM character_profiles 
    WHERE LOWER(character_name) LIKE LOWER($2)
    ORDER BY relevance DESC, character_name
    LIMIT 5
  `;
  
  result = await pool.query(nameQuery, [entity, `%${entity}%`]);
  
  if (result.rows.length > 0) {
    return {
      type: 'characters',
      data: result.rows,
      count: result.rows.length
    };
  }
  
  // Last resort: search in descriptions but mark as indirect matches
  const descQuery = `
    SELECT *,
      30 as relevance,
      'mentioned in description' as match_type
    FROM character_profiles 
    WHERE LOWER(description) LIKE LOWER($1)
    AND LOWER(character_name) NOT LIKE LOWER($1)
    ORDER BY character_name
    LIMIT 3
  `;
  
  result = await pool.query(descQuery, [`%${entity}%`]);
  
  return {
    type: 'characters',
    data: result.rows,
    count: result.rows.length,
    indirect: true
  };
}
