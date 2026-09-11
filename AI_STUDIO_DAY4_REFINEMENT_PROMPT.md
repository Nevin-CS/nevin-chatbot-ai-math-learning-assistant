# Google AI Studio Day 4 refinement prompt

Apply these changes to the existing Nevin Chatbot app without rebuilding its visual identity:

- Restrict the assistant to mathematics questions and contextual follow-ups. Politely refuse unrelated topics.
- Normalize math symbols, trim whitespace, enforce a 3000-character limit, detect obvious PII/secret patterns, and limit history to 12 turns.
- Use a system prompt that requires Concept, Step-by-step solution, Verification, Final answer, and Learning tip.
- Add deterministic tools for arithmetic and simple linear-equation verification where the environment supports tools/function calling.
- Post-process responses for empty output, excessive length, unsafe HTML, and the exact OUT_OF_SCOPE marker.
- Add timeout, retry, quota/rate-limit, invalid-response, and friendly failure states.
- Display response latency, anonymous local feedback controls, and a transparent AI accuracy disclaimer.
- Add an evaluation dataset with math, ambiguous, PII, and non-math cases. Track answer correctness, step correctness, scope accuracy, coherence, response structure, and latency. Use BLEU only as a supplemental wording metric.
- Do not fine-tune the model at this checkpoint. Use prompt engineering and deterministic verification because there is not yet a large reviewed training dataset.
- Keep API keys server-side and do not log sensitive student content.
- Run end-to-end tests for normal inputs, edge cases, multi-turn context, mobile layout, keyboard navigation, and simulated API failure.
