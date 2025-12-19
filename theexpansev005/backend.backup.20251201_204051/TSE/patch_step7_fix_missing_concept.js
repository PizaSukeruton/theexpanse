// PATCH STEP 7 FIX — SAFE CONCEPT EXTRACTION

export function ensureConcept(query, concept) {
    // If concept already exists → keep it
    if (concept && typeof concept === "string" && concept.trim().length > 0) {
        return concept.trim();
    }

    // 1: Try extracting the last noun-like token
    const cleaned = query
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .trim();

    const tokens = cleaned.split(/\s+/).filter(x => x.length > 0);

    if (tokens.length === 0) return "unknown";

    // 2: Try last token as concept
    const last = tokens[tokens.length - 1];
    if (last.length >= 3) return last;

    // 3: Try first token
    const first = tokens[0];
    if (first.length >= 3) return first;

    // 4: Full query fallback
    return cleaned;
}

