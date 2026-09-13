# Security Policy and Day 6 Agent Controls

## Primary risks

### Prompt injection
User input, retrieved documents, files, websites, memory, and tool output can contain instructions that conflict with the intended task. Treat all of these as untrusted data. Do not rely on the model alone to enforce authorization.

### Data leakage
Do not place secrets in system prompts. Minimize context, authorize retrieval before it reaches the model, redact sensitive values in logs, and scan outputs before display or export.

### Tool misuse and excessive agency
Use a default-deny tool registry, role-based access, least privilege, typed argument validation, confirmation for sensitive actions, timeouts, loop limits, and tamper-evident audit logs.

### Improper output handling
Validate output against a schema and apply context-specific escaping before using model output in HTML, Markdown, CSV, SQL, shell commands, file paths, URLs, or downstream tools.

## Candidate tools from the Day 6 brief

- LLM Guard: reference runtime input/output scanners, including prompt-injection, secret, token, and sensitive-content checks. The official repository was archived on July 9, 2026 and is no longer maintained; do not adopt it without a dependency, maintenance, and threat-model review.
- Guardrails AI: validators, schemas, and on-fail policies for model input/output.
- LangChain structured output or output parsers: predictable typed responses when the project uses LangChain.
- PromptShield: verify the exact implementation and its scope before adoption; products with this name vary between lexical scanning and semantic/API firewalls.
- ModelScan: use when loading external serialized model artifacts. It does not replace runtime prompt, output, or tool authorization controls.
- Role-based tool access: implement in application code and the backend authorization layer, not only in prompts.

## Reporting a vulnerability

Do not open a public issue containing credentials, personal data, exploitable secrets, or private customer information. Use a private channel designated by the repository owner.
