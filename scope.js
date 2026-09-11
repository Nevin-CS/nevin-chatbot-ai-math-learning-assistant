// Math-only scope guard.
// Decides whether a learner's question belongs to this mathematics tutor,
// and supplies the polite refusal text used when it does not.

const MATH_KEYWORDS = [
  'solve', 'equation', 'derivative', 'integral', 'algebra', 'geometry', 'calculus',
  'theorem', 'fraction', 'matrix', 'vector', 'probability', 'statistics', 'trigonometry',
  'polynomial', 'graph', 'function', 'limit', 'factor', 'simplify', 'differentiate',
  'integrate', 'sqrt', 'square root', 'log', 'logarithm', 'sin', 'cos', 'tan', 'angle',
  'triangle', 'circle', 'area', 'volume', 'perimeter', 'ratio', 'percent', 'percentage',
  'mean', 'median', 'mode', 'variance', 'sequence', 'series', 'exponent', 'root',
  'number', 'digit', 'prime', 'variable', 'expression', 'inequality', 'slope', 'linear',
  'quadratic', 'pythagorean', 'math', 'maths', 'mathematics', 'arithmetic'
];

const MATH_SYMBOL_PATTERN = /[0-9]|[+\-*/^=]|\bx\b|\by\b|\bsqrt\b|\bpi\b/i;

const FOLLOW_UP_PATTERN = /^(explain|why|how|simplify|more|again|that|it|show|continue|what about|and|so|ok|okay)\b/i;

/**
 * Decide whether a question is in scope for a mathematics-only tutor.
 * @param {string} text - the learner's (already normalized) question
 * @param {{hasMathContext?: boolean}} [options] - true if the conversation
 *   already contains at least one assistant turn, so short follow-ups
 *   ("explain that more simply") can be allowed without their own math terms.
 */
export function classifyMathScope(text, { hasMathContext = false } = {}) {
  const normalized = String(text || '').toLowerCase().trim();

  if (!normalized) {
    return { allowed: false, reason: 'empty' };
  }

  const hasMathKeyword = MATH_KEYWORDS.some((word) => normalized.includes(word));
  const hasMathSymbol = MATH_SYMBOL_PATTERN.test(normalized);
  const isFollowUp = hasMathContext && FOLLOW_UP_PATTERN.test(normalized) && normalized.length < 160;

  const allowed = hasMathKeyword || hasMathSymbol || isFollowUp;
  return { allowed, reason: allowed ? 'math' : 'out-of-scope' };
}

/** Standard, friendly refusal shown for non-mathematics questions. */
export function mathOnlyRefusal() {
  return (
    "I'm a mathematics-only tutor, so I'm not able to help with that request. " +
    'Ask me a math question instead \u2014 for example, an equation to solve, ' +
    "a concept to explain, or a calculation to verify \u2014 and I'll walk you through it step by step."
  );
}
