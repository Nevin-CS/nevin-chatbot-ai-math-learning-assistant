// Post-processing: clean model output, format friendly errors, detect scope
// refusals coming back from the model, and score response structure.

/** Strip any HTML the model may have produced; the app renders text only. */
export function cleanModelResponse(text) {
  return String(text || '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

/** Convert a thrown error (network, timeout, HTTP status) into a friendly message. */
export function formatUserFacingError(error) {
  const status = Number((error && error.status) || 0);

  if (error && error.name === 'AbortError') {
    return 'The request took too long to respond. Please try again in a moment.';
  }
  if (status === 429) {
    return 'The tutor is receiving a lot of requests right now. Please wait a moment and try again.';
  }
  if (status >= 500) {
    return 'The tutor service is temporarily unavailable. Please try again shortly, or use the live Gemini assistant link below.';
  }
  if (status === 404) {
    return 'The secure AI endpoint could not be reached. Please use the live Gemini assistant link below.';
  }
  return 'Something went wrong while generating a response. Please try again, or use the live Gemini assistant link below.';
}

/** Detect when the model itself declined a question as out of mathematics scope. */
export function modelMarkedOutOfScope(answer) {
  return /\b(out[- ]of[- ]scope|mathematics[- ]only tutor|math[- ]only tutor|i can only help with math)\b/i.test(
    String(answer || '')
  );
}

/** Lightweight structural signals used to label response quality in the UI. */
export function qualitySignals(answer) {
  const text = String(answer || '').toLowerCase();
  return {
    hasConcept: /concept/.test(text),
    hasSteps: /step-by-step|steps?:/.test(text),
    hasVerification: /verif/.test(text),
    hasFinalAnswer: /final answer/.test(text),
    hasLearningTip: /learning tip/.test(text)
  };
}
