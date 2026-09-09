window.NEVIN_CHATBOT_CONFIG = Object.freeze({
  // After deploying the Cloudflare Worker, paste its HTTPS URL here, e.g.
  // https://nevin-chatbot-api.YOUR-SUBDOMAIN.workers.dev
  apiBaseUrl: "https://nevin-chatbot-api.pintonevin.workers.dev",
  defaultProvider: "auto",
  requestTimeoutMs: 20000,
  maxConversationTurns: 12
});
