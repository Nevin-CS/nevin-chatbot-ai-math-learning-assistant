import { classifyMathScope, mathOnlyRefusal } from './src/scope.js';
import { preprocessQuestion, sanitizeHistory } from './src/preprocess.js';
import { selectMathTool } from './src/math-tools.js';
import { cleanModelResponse, formatUserFacingError, modelMarkedOutOfScope, qualitySignals } from './src/postprocess.js';

const cfg = window.NEVIN_CHATBOT_CONFIG || {};
const state = {
  messages: [],
  busy: false,
  lastQuestion: '',
  lastAnswer: '',
  lastLatencyMs: null,
  lastProvider: '',
  lastCacheKey: ''
};

const $ = (id) => document.getElementById(id);
const els = {
  question: $('question'),
  level: $('level'),
  solve: $('solveBtn'),
  clear: $('clearBtn'),
  conversation: $('conversation'),
  status: $('statusBadge'),
  title: $('answerTitle'),
  actions: $('responseActions'),
  error: $('errorBox'),
  copy: $('copyBtn'),
  retry: $('retryBtn'),
  charCount: $('charCount'),
  tokenCount: $('tokenCount'),
  latency: $('latencyValue'),
  quality: $('qualityValue'),
  menu: $('menuButton'),
  nav: $('mainNav'),
  liveAppLink: $('liveAppLink')
};

function nowLabel() {
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date());
}

function setStatus(text, kind = 'ok') {
  els.status.textContent = text;
  els.status.dataset.kind = kind;
}

function showError(message = '') {
  els.error.hidden = !message;
  els.error.textContent = message;
}

function appendMessage(role, text, label, details = '') {
  const empty = els.conversation.querySelector('.empty-state');
  if (empty) empty.remove();

  const wrapper = document.createElement('article');
  wrapper.className = `message ${role}`;

  const meta = document.createElement('div');
  meta.className = 'meta';
  const name = document.createElement('strong');
  name.textContent = label || (role === 'user' ? 'You' : 'Nevin Chatbot');
  const time = document.createElement('span');
  time.textContent = details ? `${nowLabel()} · ${details}` : nowLabel();
  meta.append(name, time);

  const body = document.createElement('div');
  body.className = 'message-body';
  body.textContent = text;

  wrapper.append(meta, body);
  els.conversation.appendChild(wrapper);
  els.conversation.scrollTop = els.conversation.scrollHeight;
}

function updateInputMetrics() {
  const value = els.question.value;
  els.charCount.textContent = String(value.length);
  els.tokenCount.textContent = String(Math.max(0, Math.ceil(value.trim().length / 4)));
}

function responseQualityLabel(answer) {
  const signals = qualitySignals(answer);
  const score = Object.values(signals).filter(Boolean).length;
  if (score >= 4) return 'Structured';
  if (score >= 2) return 'Partial structure';
  return 'Needs review';
}

function cacheKey(question, level) {
  return `nevin:v5:${level}:${question.toLowerCase()}`;
}

function getCachedAnswer(key) {
  if (!cfg.cacheRepeatedQuestions) return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.answer !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

function setCachedAnswer(key, value) {
  if (!cfg.cacheRepeatedQuestions) return;
  try {
    sessionStorage.setItem(key, JSON.stringify({ ...value, cachedAt: new Date().toISOString() }));
  } catch {
    // Caching is optional. The app remains functional if storage is unavailable.
  }
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function callBackend(question, level, toolResult) {
  const base = String(cfg.apiBaseUrl || '').replace(/\/$/, '');
  if (!base) throw new Error('The secure AI endpoint is not configured.');

  const history = sanitizeHistory(state.messages, {
    maxTurns: Number(cfg.maxConversationTurns || 12),
    maxCharsPerMessage: 1800
  });

  const body = {
    provider: cfg.defaultProvider || 'gemini',
    message: question,
    learningLevel: level,
    level,
    history,
    messages: [...history, { role: 'user', content: question }],
    clientToolResult: toolResult || null
  };

  const paths = Array.isArray(cfg.apiPaths) && cfg.apiPaths.length ? cfg.apiPaths : ['/chat'];
  let lastError = new Error('No API route was available.');

  for (const path of paths) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const started = performance.now();
      try {
        const response = await fetchWithTimeout(`${base}${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          credentials: 'omit',
          cache: 'no-store',
          referrerPolicy: 'no-referrer'
        }, Number(cfg.requestTimeoutMs || 20000));

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const error = new Error(data.error || data.details || `Request failed (${response.status}).`);
          error.status = response.status;
          if (response.status === 404) break;
          throw error;
        }

        const rawAnswer = data.reply || data.answer || data.output || '';
        if (typeof rawAnswer !== 'string' || !rawAnswer.trim()) throw new Error('The tutor returned an invalid response.');

        return {
          answer: cleanModelResponse(rawAnswer),
          provider: data.provider || 'gemini',
          model: data.model || '',
          tool: data.tool || toolResult?.name || null,
          latencyMs: Math.round(performance.now() - started),
          outOfScope: Boolean(data.outOfScope)
        };
      } catch (error) {
        lastError = error;
        const retryable = error.name === 'AbortError' || [429, 502, 503, 504].includes(Number(error.status || 0));
        if (attempt === 0 && retryable) {
          await new Promise((resolve) => setTimeout(resolve, 600));
          continue;
        }
        break;
      }
    }
  }

  throw lastError;
}

function localFallback(question, level) {
  const tool = selectMathTool(question);
  if (!tool) return null;

  if (tool.name === 'calculate_expression') {
    return {
      answer: `Concept:\nThis is an arithmetic expression. Use the order of operations.\n\nStep-by-step solution:\n1. Normalize the symbols in the expression.\n2. Evaluate parentheses and exponents.\n3. Evaluate multiplication and division, then addition and subtraction.\n\nVerification:\nThe deterministic calculator evaluated ${tool.output.expression}.\n\nFinal answer:\n${tool.output.value}\n\nLearning tip:\nRecalculate the expression in a second way when the result will be used for graded work.`,
      provider: 'local verifier',
      tool: tool.name,
      latencyMs: 0
    };
  }

  if (tool.name === 'solve_linear_equation') {
    const { a, b, c } = tool.output.coefficients;
    const x = tool.output.solution;
    const detail = level === 'middle-school' ? 'Undo the operations around x while doing the same thing to both sides.' : 'Preserve equality by applying the same inverse operation to both sides.';
    return {
      answer: `Concept:\nLinear equations keep the variable to the first power. ${detail}\n\nStep-by-step solution:\n1. Start with ${tool.output.equation}.\n2. Move the constant term: ${a}x = ${c - b}.\n3. Divide both sides by ${a}: x = ${x}.\n\nVerification:\nSubstitution gives ${a}(${x}) ${b >= 0 ? '+' : '-'} ${Math.abs(b)} = ${c}. Verification passed: ${tool.output.verification}.\n\nFinal answer:\nx = ${x}\n\nLearning tip:\nAlways substitute your value back into the original equation.`,
      provider: 'local verifier',
      tool: tool.name,
      latencyMs: 0
    };
  }

  return null;
}

async function solve() {
  if (state.busy) return;

  let prepared;
  try {
    prepared = preprocessQuestion(els.question.value, { maxChars: Number(cfg.maxQuestionChars || 3000) });
  } catch (error) {
    showError(error.message);
    els.question.focus();
    return;
  }

  const hasMathContext = state.messages.some((message) => message.role === 'assistant');
  const scope = classifyMathScope(prepared.normalized, { hasMathContext });
  if (!scope.allowed) {
    const refusal = mathOnlyRefusal();
    appendMessage('user', prepared.normalized, 'You');
    appendMessage('assistant', refusal, 'Nevin Chatbot · math-only guard');
    state.messages.push({ role: 'user', content: prepared.normalized }, { role: 'assistant', content: refusal });
    state.lastQuestion = prepared.normalized;
    state.lastAnswer = refusal;
    state.lastProvider = 'scope guard';
    els.actions.hidden = false;
    els.title.textContent = 'Math-only guidance';
    els.latency.textContent = '0 ms';
    els.quality.textContent = 'Correct refusal';
    setStatus('Math-only scope', 'ok');
    els.question.value = '';
    updateInputMetrics();
    return;
  }

  state.busy = true;
  state.lastQuestion = prepared.normalized;
  showError('');
  els.solve.disabled = true;
  els.solve.textContent = 'Thinking…';
  setStatus('Understanding question', 'busy');
  appendMessage('user', prepared.normalized, 'You', `~${prepared.estimatedTokens} input tokens`);

  const level = els.level.value;
  const key = cacheKey(prepared.normalized, level);
  const cached = getCachedAnswer(key);

  try {
    let result;
    if (cached) {
      result = { ...cached, latencyMs: 0, provider: `${cached.provider || 'AI'} · session cache` };
    } else {
      const toolResult = selectMathTool(prepared.normalized);
      setStatus(toolResult ? 'Verifying with math tool' : 'Generating explanation', 'busy');
      try {
        result = await callBackend(prepared.normalized, level, toolResult);
        if (result.outOfScope || modelMarkedOutOfScope(result.answer)) {
          result = { answer: mathOnlyRefusal(), provider: 'math-only guard', latencyMs: result.latencyMs, tool: null };
        }
        setCachedAnswer(key, result);
      } catch (apiError) {
        const fallback = localFallback(prepared.normalized, level);
        if (!fallback) throw apiError;
        result = fallback;
      }
    }

    state.messages.push({ role: 'user', content: prepared.normalized }, { role: 'assistant', content: result.answer });
    const maxMessages = Math.max(4, Number(cfg.maxConversationTurns || 12) * 2);
    if (state.messages.length > maxMessages) state.messages = state.messages.slice(-maxMessages);

    state.lastAnswer = result.answer;
    state.lastLatencyMs = result.latencyMs;
    state.lastProvider = result.provider;
    state.lastCacheKey = key;

    const details = [result.provider, result.model, result.tool ? `tool: ${result.tool}` : '', `${result.latencyMs} ms`].filter(Boolean).join(' · ');
    appendMessage('assistant', result.answer, 'Nevin Chatbot', details);
    els.title.textContent = 'Learning response';
    els.latency.textContent = `${result.latencyMs} ms`;
    els.quality.textContent = responseQualityLabel(result.answer);
    els.actions.hidden = false;
    setStatus('Ready', 'ok');
    els.question.value = '';
    updateInputMetrics();
  } catch (error) {
    const friendly = formatUserFacingError(error);
    showError(friendly);
    setStatus('Needs attention', 'error');
    if (cfg.primaryLiveAppUrl && els.liveAppLink) {
      els.liveAppLink.hidden = false;
      els.liveAppLink.href = cfg.primaryLiveAppUrl;
    }
  } finally {
    state.busy = false;
    els.solve.disabled = false;
    els.solve.textContent = 'Explain step by step';
  }
}

function clearConversation() {
  state.messages = [];
  state.lastQuestion = '';
  state.lastAnswer = '';
  state.lastLatencyMs = null;
  state.lastProvider = '';
  state.lastCacheKey = '';
  els.conversation.innerHTML = '<div class="empty-state"><div class="empty-icon">ƒ(x)</div><p>Ask a math question to begin. Nevin Chatbot will explain the concept, show the steps, and help you verify the result.</p></div>';
  els.actions.hidden = true;
  showError('');
  els.title.textContent = 'Ready when you are';
  els.latency.textContent = '—';
  els.quality.textContent = '—';
  setStatus('Math tutor ready', 'ok');
  els.question.value = '';
  updateInputMetrics();
  els.question.focus();
}

function saveFeedback(value) {
  const entry = {
    value,
    question: state.lastQuestion.slice(0, 300),
    answerPreview: state.lastAnswer.slice(0, 300),
    provider: state.lastProvider,
    latencyMs: state.lastLatencyMs,
    createdAt: new Date().toISOString()
  };
  try {
    const existing = JSON.parse(localStorage.getItem('nevinFeedback') || '[]');
    existing.push(entry);
    localStorage.setItem('nevinFeedback', JSON.stringify(existing.slice(-50)));
    setStatus('Feedback saved locally', 'ok');
  } catch {
    setStatus('Feedback noted for this session', 'ok');
  }
}

function regenerate() {
  if (!state.lastQuestion || state.busy) return;
  if (state.lastCacheKey) sessionStorage.removeItem(state.lastCacheKey);
  els.question.value = state.lastQuestion;
  updateInputMetrics();
  solve();
}

document.querySelectorAll('[data-q]').forEach((button) => {
  button.addEventListener('click', () => {
    els.question.value = button.dataset.q || '';
    updateInputMetrics();
    els.question.focus();
  });
});

document.querySelectorAll('[data-feedback]').forEach((button) => {
  button.addEventListener('click', () => saveFeedback(button.dataset.feedback || 'unknown'));
});

els.solve.addEventListener('click', solve);
els.clear.addEventListener('click', clearConversation);
els.retry.addEventListener('click', regenerate);
els.copy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(state.lastAnswer);
    setStatus('Answer copied', 'ok');
  } catch {
    showError('Copy is unavailable in this browser. Select the answer text and copy it manually.');
  }
});
els.question.addEventListener('input', updateInputMetrics);
els.question.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    solve();
  }
});
els.menu.addEventListener('click', () => {
  const open = els.nav.classList.toggle('open');
  els.menu.setAttribute('aria-expanded', String(open));
});
els.nav.addEventListener('click', () => {
  els.nav.classList.remove('open');
  els.menu.setAttribute('aria-expanded', 'false');
});

updateInputMetrics();
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
}
