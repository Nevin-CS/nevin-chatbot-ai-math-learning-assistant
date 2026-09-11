// Deterministic math tools used to verify supported calculations
// (adapted from the function-calling pattern: calculate_expression, solve_linear_equation).

function normalizeSymbols(text) {
  return String(text || '')
    .replace(/\u00d7/g, '*')
    .replace(/\u00f7/g, '/')
    .replace(/\u2212/g, '-');
}

function safeEvaluateArithmetic(expression) {
  const cleaned = expression.replace(/\s+/g, '');
  if (!cleaned || !/^[0-9+\-*/().]+$/.test(cleaned)) return null;
  if (!/[0-9]/.test(cleaned) || !/[+\-*/]/.test(cleaned)) return null;

  try {
    // eslint-disable-next-line no-new-func
    const value = Function(`"use strict"; return (${cleaned});`)();
    if (typeof value !== 'number' || !Number.isFinite(value)) return null;
    return Number(value.toFixed(6));
  } catch {
    return null;
  }
}

function parseLinearEquation(text) {
  // Matches forms like: 2x + 7 = 19, -3x - 4 = 5, x = 10
  const match = text.match(/(-?\d*\.?\d*)\s*x\s*([+\-]\s*\d+\.?\d*)?\s*=\s*(-?\d+\.?\d*)/i);
  if (!match) return null;

  const [, aRaw, bRaw, cRaw] = match;
  let a;
  if (aRaw === '' || aRaw === undefined) a = 1;
  else if (aRaw === '-') a = -1;
  else a = Number(aRaw);

  const b = bRaw ? Number(bRaw.replace(/\s+/g, '')) : 0;
  const c = Number(cRaw);

  if (!Number.isFinite(a) || a === 0 || !Number.isFinite(b) || !Number.isFinite(c)) return null;

  const solution = Number(((c - b) / a).toFixed(6));
  const verification = Math.abs(a * solution + b - c) < 1e-6;
  const signLabel = b >= 0 ? '+' : '-';

  return {
    equation: `${a === 1 ? '' : a === -1 ? '-' : a}x ${signLabel} ${Math.abs(b)} = ${c}`.trim(),
    coefficients: { a, b, c },
    solution,
    verification
  };
}

/**
 * Choose and run a deterministic verification tool for a question, if one applies.
 * @param {string} question
 * @returns {{name: string, output: object} | null}
 */
export function selectMathTool(question) {
  const normalized = normalizeSymbols(question);

  const linear = parseLinearEquation(normalized);
  if (linear) {
    return { name: 'solve_linear_equation', output: linear };
  }

  const expressionMatch = normalized.match(/-?\d+(\.\d+)?(\s*[+\-*/]\s*-?\d+(\.\d+)?)+/);
  if (expressionMatch) {
    const value = safeEvaluateArithmetic(expressionMatch[0]);
    if (value !== null) {
      return { name: 'calculate_expression', output: { expression: expressionMatch[0].trim(), value } };
    }
  }

  return null;
}
