// Input preprocessing: validation, normalization, and conversation-history trimming.

const PII_PATTERN =
  /\b\d{3}-\d{2}-\d{4}\b|\b(?:\d[ -]*?){13,16}\b|password\s*[:=]|api[_-]?key\s*[:=]|secret\s*[:=]/i;

/**
 * Validate and normalize a raw textarea value.
 * Throws an Error with a user-facing message when the input is invalid.
 * @param {string} rawValue
 * @param {{maxChars?: number}} [options]
 * @returns {{normalized: string, estimatedTokens: number}}
 */
export function preprocessQuestion(rawValue, { maxChars = 3000 } = {}) {
  const value = String(rawValue ?? '');
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error('Enter a math question before submitting.');
  }

  if (trimmed.length > maxChars) {
    throw new Error(`Your question is too long. Please shorten it to ${maxChars} characters or fewer.`);
  }

  const normalized = trimmed
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u00d7/g, '*')
    .replace(/\u00f7/g, '/')
    .replace(/\u2212/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

  if (PII_PATTERN.test(normalized)) {
    throw new Error(
      'Please remove personal or sensitive information (IDs, passwords, card or account numbers) before submitting.'
    );
  }

  const estimatedTokens = Math.max(1, Math.ceil(normalized.length / 4));
  return { normalized, estimatedTokens };
}

/**
 * Trim conversation history to a bounded number of turns and per-message length
 * before it is sent to the backend.
 * @param {{role: string, content: string}[]} messages
 * @param {{maxTurns?: number, maxCharsPerMessage?: number}} [options]
 */
export function sanitizeHistory(messages, { maxTurns = 12, maxCharsPerMessage = 1800 } = {}) {
  const source = Array.isArray(messages) ? messages : [];
  return source.slice(-maxTurns * 2).map((message) => ({
    role: message && message.role === 'assistant' ? 'assistant' : 'user',
    content: String((message && message.content) || '').slice(0, maxCharsPerMessage)
  }));
}
