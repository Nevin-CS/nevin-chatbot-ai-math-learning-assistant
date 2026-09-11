# DDS Building Agentic AI Challenge — Day 4 Submission Notes

## Objective

Enhance the LLM/API integration, strengthen prompt quality, preprocess input, post-process responses, test the complete user flow, measure performance, protect privacy, and prepare the project for Day 5 interface integration.

## API and model

- Live model path: Gemini through the Google AI Studio deployment.
- Optional repository backend: Cloudflare Worker with server-side `GEMINI_API_KEY`.
- Public learners do not enter an API key or credit card.

## Prompt engineering

The prompt now enforces mathematics-only scope, learning-level adaptation, concept-first explanations, numbered steps, verification, a clear final answer, and a learning tip. It also defines an exact out-of-scope behavior.

## Data handling

- Trim and normalize text and mathematical symbols.
- Remove control characters and repeated whitespace.
- Limit input to 3000 characters.
- Estimate token use before submission.
- Detect common PII and secret patterns.
- Keep only the latest 12 conversation turns.
- Post-process empty, unsafe, out-of-scope, and overly long model output.

## Tool/function pattern

The project adapts the function-calling pattern to deterministic math tools for arithmetic and linear-equation verification. The verified tool output is supplied to the model as evidence for the explanation.

## Evaluation and testing

- Mathematics accuracy
- Step correctness
- Concept clarity and coherence
- Response-format compliance
- Safe refusal of non-math questions
- API latency
- Empty, long, ambiguous, PII, timeout and quota cases
- Multi-turn follow-ups
- Mobile and keyboard accessibility
- BLEU-2 as a supplemental wording metric only

## Fine-tuning decision

Fine-tuning was not appropriate on Day 4 because there is not yet a sufficiently large, reviewed, rights-cleared custom tutoring dataset. Prompt engineering and tool-assisted verification were selected instead.

## Challenges and improvements

- Static GitHub Pages cannot safely store provider keys. The live Gemini version is hosted through Google AI Studio, while the repository includes a secure backend option.
- Earlier frontend/backend route and response-field mismatches were fixed by supporting both `/chat` and `/api/chat`, and both `reply` and `answer` fields.
- The old broad fallback was replaced with a strict math-only guard and a transparent local verifier for supported calculations.

## Current status

- Live Gemini app: https://nevin-chatbot-ai-math-learning-assistant.ai.studio/
- Repository: https://github.com/Nevin-CS/nevin-chatbot-ai-math-learning-assistant
- GitHub Pages: https://nevin-cs.github.io/nevin-chatbot-ai-math-learning-assistant/

## Day 5 next steps

Complete interface integration, run the live evaluation set, capture final screenshots, improve mobile behavior based on feedback, and keep submission links current.
