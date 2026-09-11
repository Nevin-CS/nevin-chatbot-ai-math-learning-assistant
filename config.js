window.NEVIN_CHATBOT_CONFIG = Object.freeze({
  apiBaseUrl: 'https://nevin-chatbot-api.pintonevin.workers.dev',
  apiPaths: ['/chat', '/api/chat'],
  primaryLiveAppUrl: 'https://nevin-chatbot-ai-math-learning-assistant.ai.studio/',
  defaultProvider: 'gemini',
  requestTimeoutMs: 20000,
  maxConversationTurns: 12,
  maxQuestionChars: 3000,
  cacheRepeatedQuestions: true
});
