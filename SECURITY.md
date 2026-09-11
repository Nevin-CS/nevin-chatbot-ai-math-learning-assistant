# Security Policy

## Report a vulnerability

Do not publish API keys, passwords, or sensitive user data in a public issue. Contact the project owner privately through the contact method listed in the repository profile.

## Security controls in this project

- No provider secrets in browser code
- Environment-variable / secret-store configuration for Gemini
- Exact-origin CORS restriction
- Input length and request-size limits
- PII and secret-pattern checks
- Safe text rendering instead of model-generated HTML
- Timeout, retry, and generic user-facing error handling
- No payment form, user account, advertising tracker, or third-party analytics

## Known limitations

GitHub Pages is static hosting and cannot enforce arbitrary HTTP response headers. A CSP meta policy is included, but production deployments may use a host that supports stronger security headers.

The in-memory Worker rate limiter is best-effort and may reset across isolates. A durable production rate limiter can be added later if traffic increases.
