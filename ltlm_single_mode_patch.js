//
// NEW LTLM SINGLE MODE UI BLOCK
//

panel.innerHTML = `
    <h3 class="section-header">ADD NEW LTLM TRAINING EXAMPLE</h3>

    <div class="form-grid">

        <label>Utterance</label>
        <textarea id="ltlm-utterance" class="terminal-textarea" rows="3"></textarea>

        <label>Dialogue Function</label>
        <input id="ltlm-dialogue" class="terminal-input" placeholder="dialogue_function_code">

        <label>Speech Act</label>
        <input id="ltlm-speech" class="terminal-input" placeholder="speech_act_code">

        <label>Narrative Function (optional)</label>
        <input id="ltlm-narrative" class="terminal-input" placeholder="narrative_function_code">

        <label>PAD — Pleasure</label>
        <input id="ltlm-pad-p" class="terminal-input" placeholder="0.0">

        <label>PAD — Arousal</label>
        <input id="ltlm-pad-a" class="terminal-input" placeholder="0.0">

        <label>PAD — Dominance</label>
        <input id="ltlm-pad-d" class="terminal-input" placeholder="0.0">

        <label>Outcome Intent Codes (comma separated)</label>
        <input id="ltlm-outcome" class="terminal-input" placeholder="cognitive_outcomes.increase_understanding">

        <label>Tags (comma separated)</label>
        <input id="ltlm-tags" class="terminal-input">

        <label>Notes</label>
        <textarea id="ltlm-notes" class="terminal-textarea" rows="2"></textarea>

        <label>Source</label>
        <input id="ltlm-source" class="terminal-input" placeholder="cms_single_mode">

        <label>Created By</label>
        <input id="ltlm-created" class="terminal-input" placeholder="cms_ltlm">
    </div>

    <button class="action-button" onclick="submitLTLMSingle('${characterId}')"
        style="margin-top:15px; width:100%;">SUBMIT SINGLE EXAMPLE</button>
`;

window.submitLTLMSingle = async (characterId) => {
    const payload = {
        mode: "single",
        speaker_character_id: characterId,
        utterance_text: document.getElementById("ltlm-utterance").value,
        dialogue_function_code: document.getElementById("ltlm-dialogue").value,
        speech_act_code: document.getElementById("ltlm-speech").value,
        narrative_function_code: document.getElementById("ltlm-narrative").value || null,
        pad: {
            p: Number(document.getElementById("ltlm-pad-p").value),
            a: Number(document.getElementById("ltlm-pad-a").value),
            d: Number(document.getElementById("ltlm-pad-d").value),
        },
        source: document.getElementById("ltlm-source").value || "cms_single_mode",
        is_canonical: true,
        difficulty: 1,
        tags: document.getElementById("ltlm-tags").value.split(",").map(x => x.trim()).filter(Boolean),
        notes: document.getElementById("ltlm-notes").value,
        outcome_intent_codes: document.getElementById("ltlm-outcome").value.split(",").map(x => x.trim()).filter(Boolean),
        created_by: document.getElementById("ltlm-created").value || "cms_ltlm"
    };

    const res = await fetch("/api/ltlm/training", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success) {
        alert("Inserted training example: " + data.training_example_id);
        showLTLMTraining(characterId);
    } else {
        alert("Error: " + data.message);
    }
};
