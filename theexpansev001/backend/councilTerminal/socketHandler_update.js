// Add this section after the intent matching in processCommand function

// Check for partial name matches and suggest full names
async function getSuggestions(entity) {
  const suggestions = [];
  
  // Check for partial character name matches
  const charQuery = `
    SELECT character_name FROM character_profiles 
    WHERE LOWER(character_name) LIKE LOWER($1)
    LIMIT 3
  `;
  
  const result = await pool.query(charQuery, [`%${entity}%`]);
  
  if (result.rows.length > 0) {
    result.rows.forEach(row => {
      if (row.character_name.toLowerCase() !== entity.toLowerCase()) {
        suggestions.push(row.character_name);
      }
    });
  }
  
  return suggestions;
}

// Modify the section where "No data found" is returned
if (result.count === 0) {
  const suggestions = await getSuggestions(intent.entity);
  
  let output = `No data found for: "${intent.entity}"`;
  
  if (suggestions.length > 0) {
    output += `\n\nDid you mean:\n`;
    suggestions.forEach(suggestion => {
      output += `• ${suggestion}\n`;
    });
    output += `\nTry using the full character name for best results.`;
  }
  
  return { output };
}

// Also add character name education in successful queries
if (result.type === 'characters' && result.data.length > 0) {
  const partialMatch = intent.entity.toLowerCase();
  const fullName = result.data[0].character_name;
  
  // If they used a partial name, educate them
  if (partialMatch !== fullName.toLowerCase() && 
      !partialMatch.includes(fullName.toLowerCase())) {
    result.educationalNote = `Note: Using full name "${fullName}" provides more accurate results.`;
  }
}
