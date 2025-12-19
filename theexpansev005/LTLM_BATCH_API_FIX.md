# LTLM Batch API Migration - Complete Summary

## Task 1: Completed ✓

Updated `cms/js/adminMenu.js` to use new `/api/ltlm/training` batch endpoint.

### Key Changes

**Endpoint:**
- Old: `POST /api/ltlm/training/insert`
- New: `POST /api/ltlm/training`

**Payload Format:**
- Mode: `batch`
- Speaker ID: `speaker_character_id` (was `character_id`)
- Created By: `created_by`
- Lines format: `utterance|dialogue_code|speech_code|narrative|intents|padP|padA|padD`

**Example Lines:**
<SUBJECT> seems quiet|discourse_structuring|assertive|NULL||0.0|0.0|0.0
<SUBJECT> appears withdrawn|discourse_structuring|assertive|NULL||0.0|0.0|0.0

text

**Code Change (lines 719-746):**
window.submitLTLM = async (characterId) => {
const templates = document.getElementById("ltlm-bulk").value
.split("\n")
.map(x => x.trim())
.filter(x => x.length > 0);

text
const payload = {
    mode: "batch",
    speaker_character_id: characterId,
    created_by: document.getElementById("ltlm-created").value || "cms_ltlm",
    lines: templates.map(utterance => 
        `${utterance}|discourse_structuring|assertive|NULL||0.0|0.0|0.0`
    )
};

const res = await fetch(`/api/ltlm/training`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload)
});

const data = await res.json();

if (data.success) {
    alert("Training rows inserted: " + data.inserted);
    showLTLMTraining(characterId);
} else {
    alert("Error: " + data.message);
}
};

text

## Architecture Impact

**Old Path (deprecated):**
- CMS → `/api/ltlm/training/insert`
- Backend → `training_insertion_data` table
- Payload: `{character_id, category, pad_dominance, appropriateness_score, templates[]}`

**New Path (active):**
- CMS → `/api/ltlm/training` (batch mode)
- Backend → `ltlm_training_examples` + `ltlm_training_outcome_intents` tables
- Payload: `{mode: "batch", speaker_character_id, created_by, lines[]}`

## Next Steps

1. Remove duplicate `renderLTLMAnalytics` function (around lines 805-860)
2. Add backend validation for PAD ranges (-1 to +1)
3. Add backend validation for category code existence
4. Add UI dropdowns for ontology code selection (instead of placeholders)

## Backup

Original: `cms/js/adminMenu.js.backup_20251211_082300`
