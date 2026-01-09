export function ensureConcept(query, concept) {
    if (concept && concept.trim().length > 0) {
        return concept.trim().toLowerCase();
    }
    return query.trim().toLowerCase();
}
