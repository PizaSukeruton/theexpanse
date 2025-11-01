const helpPatterns = [
  /^help$/i,
  /^what can (?:i|you) do/i,
  /^what functions/i,
  /^how (?:do i|to) use/i,
  /^commands?$/i,
  /^options?$/i,
  /^what (?:are|is) (?:the|your) (?:commands?|functions?)/i
];

export function isHelpQuery(query) {
  const normalized = query.toLowerCase().trim();
  return helpPatterns.some(pattern => normalized.match(pattern));
}

export function getHelpResponse() {
  return `[QUERY PATTERNS RECOGNIZED]

WHO...
WHAT...
WHEN...
WHERE...
WHY...
HOW...
CAN YOU...
SHOW ME...
SEARCH...

CLEAR - Reset terminal
LOGOUT - Exit system
STATUS - System info`;
}

export default { isHelpQuery, getHelpResponse };
