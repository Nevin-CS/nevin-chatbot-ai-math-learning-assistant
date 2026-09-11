# Nevin Chatbot — AI Math Learning Assistant

A mathematics-only AI tutor built for the **DDS Building Agentic AI Application Challenge 2026**.

- **Primary live Gemini app:** https://nevin-chatbot-ai-math-learning-assistant.ai.studio/
- **GitHub Pages project site:** https://nevin-cs.github.io/nevin-chatbot-ai-math-learning-assistant/
- **Repository:** https://github.com/Nevin-CS/nevin-chatbot-ai-math-learning-assistant

## Purpose

Nevin Chatbot helps students understand mathematics through concept explanations, step-by-step solutions, verification, learning-level adaptation, and follow-up questions. It intentionally refuses questions outside mathematics.

## Day 4 improvements

- Prompt-engineered math-only tutoring behavior
- Multi-turn context limited to the latest 12 turns
- Input cleaning, symbol normalization, length limits, token estimates, and PII/secret checks
- Post-processing for empty, unsafe, overly long, and out-of-scope responses
- Deterministic tools for arithmetic and simple linear-equation verification
- Compatibility with both `/chat` and `/api/chat` backend routes
- API retries, 20-second timeout, quota/rate-limit messages, and safe fallbacks
- Response-latency display and local feedback controls
- Evaluation cases for accuracy, coherence, scope control, privacy, edge cases, and latency
- Supplemental BLEU-2 implementation for wording similarity
- Optional LangSmith evaluator prompt and observability guide
- SEO, accessibility, privacy, PWA, and GitHub Actions checks

## Seven-step LLM workflow

1. Problem
2. Use case
3. Prompt
4. Tools and data
5. Prototype
6. Evaluate
7. Deploy and improve

See [`docs/SEVEN_STEP_LLM_PROJECT.md`](docs/SEVEN_STEP_LLM_PROJECT.md).

## Architecture

```text
Student / Teacher
       ↓
GitHub Pages or Google AI Studio UI
       ↓
Input preprocessing + math-only scope guard
       ↓
Secure server-side Gemini integration
       ↓
Deterministic verification tool when supported
       ↓
Post-processing + response metrics + feedback
```

## Free learner access

The interface contains no payment page, credit-card field, advertising tracker, or requirement for students and teachers to provide an API key. Provider quotas or costs, if any, remain the project owner's responsibility.

## Run the static project locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Secure Gemini backend

The included Cloudflare Worker supports:

- `GET /health`
- `POST /chat`
- `POST /api/chat`

Set the following in Cloudflare:

```text
ALLOWED_ORIGIN=https://nevin-cs.github.io
GEMINI_MODEL=<model available to your account>
GEMINI_API_KEY=<encrypted Cloudflare secret>
```

Never place provider keys in `config.js`, `app.js`, HTML, screenshots, or the public repository.

## Prompt engineering

The system prompt enforces:

- mathematics-only scope
- concept-first teaching
- numbered steps
- verification
- final-answer clarity
- learning-level adaptation
- safe refusal and privacy behavior

See [`src/prompt.js`](src/prompt.js).

## Function/tool use

Day 4 adapts the function-calling pattern to math verification:

- `calculate_expression`
- `solve_linear_equation`

The tool output is passed to the model as verification context. See [`docs/OPENAI_FUNCTION_CALLING_ADAPTATION.md`](docs/OPENAI_FUNCTION_CALLING_ADAPTATION.md).

## Evaluation

Run unit and static checks:

```bash
npm test
npm run check
```

Run the live evaluation harness against the configured Worker:

```bash
NEVIN_API_ENDPOINT="https://nevin-chatbot-api.pintonevin.workers.dev/chat" npm run evaluate
```

The harness records:

- final-answer pattern accuracy
- math-only refusal accuracy
- response-structure score
- BLEU-2 as a supplemental metric
- end-to-end latency

BLEU is not treated as the main quality measure because correct tutoring answers can use different wording.

## Fine-tuning decision

Fine-tuning is **not used on Day 4**. The project does not yet have a sufficiently large, reviewed, rights-cleared tutoring dataset. Prompt engineering, deterministic verification, and systematic evaluation are the safer and faster choices for this checkpoint.

## No-code / low-code evidence

Google AI Studio Build mode is the primary low-code environment used for the live Gemini application. The repository contains an AI Studio refinement prompt and evidence screenshots for the Day 4 workbook.

## Security and privacy

- API keys remain server-side
- CORS origin restriction
- message and request-size limits
- PII/secret-pattern checks
- safe text rendering
- no raw stack traces shown to learners
- no analytics or advertising trackers
- local feedback storage by default

See [`privacy.html`](privacy.html), [`SECURITY.md`](SECURITY.md), and [`observability/LANGSMITH_OPTIONAL_SETUP.md`](observability/LANGSMITH_OPTIONAL_SETUP.md).

## Day 5 next steps

- Complete interface integration testing
- Run the full live evaluation set and record measured results
- Capture successful conversations and edge-case screenshots
- Improve mobile usability based on feedback
- Keep the final submission links and README current

## Educational disclaimer

AI-generated mathematical explanations can make mistakes. Verify important calculations and follow school or university academic-integrity rules.
