/**
 * StudyMate AI Chatbot Engine
 * Central provider registry with secure administrator-managed credentials.
 */
import crypto from 'crypto';
import { getAiConfig } from './db.js';

export const AI_PROVIDERS = {
  offline: { label: 'Offline knowledge engine', defaultModel: '', type: 'offline' },
  openai: { label: 'OpenAI', defaultModel: 'gpt-5-mini', baseUrl: 'https://api.openai.com/v1', envKey: 'OPENAI_API_KEY', envModel: 'OPENAI_MODEL', type: 'openai-compatible' },
  anthropic: { label: 'Anthropic Claude', defaultModel: 'claude-sonnet-4-5', envKey: 'ANTHROPIC_API_KEY', envModel: 'ANTHROPIC_MODEL', type: 'anthropic' },
  gemini: { label: 'Google Gemini', defaultModel: 'gemini-3.8-flash', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', envKey: 'GEMINI_API_KEY', envModel: 'GEMINI_MODEL', type: 'gemini' },
  groq: { label: 'Groq', defaultModel: 'llama-3.3-70b-versatile', baseUrl: 'https://api.groq.com/openai/v1', envKey: 'GROQ_API_KEY', envModel: 'GROQ_MODEL', type: 'openai-compatible' },
  deepseek: { label: 'DeepSeek', defaultModel: 'deepseek-chat', baseUrl: 'https://api.deepseek.com/v1', envKey: 'DEEPSEEK_API_KEY', envModel: 'DEEPSEEK_MODEL', type: 'openai-compatible' },
  mistral: { label: 'Mistral AI', defaultModel: 'mistral-small-latest', baseUrl: 'https://api.mistral.ai/v1', envKey: 'MISTRAL_API_KEY', envModel: 'MISTRAL_MODEL', type: 'openai-compatible' },
  xai: { label: 'xAI (Grok)', defaultModel: 'grok-4', baseUrl: 'https://api.x.ai/v1', envKey: 'XAI_API_KEY', envModel: 'XAI_MODEL', type: 'openai-compatible' },
  openrouter: { label: 'OpenRouter', defaultModel: 'openai/gpt-5-mini', baseUrl: 'https://openrouter.ai/api/v1', envKey: 'OPENROUTER_API_KEY', envModel: 'OPENROUTER_MODEL', type: 'openai-compatible' },
  together: { label: 'Together AI', defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', baseUrl: 'https://api.together.xyz/v1', envKey: 'TOGETHER_API_KEY', envModel: 'TOGETHER_MODEL', type: 'openai-compatible' },
  cerebras: { label: 'Cerebras', defaultModel: 'llama-3.3-70b', baseUrl: 'https://api.cerebras.ai/v1', envKey: 'CEREBRAS_API_KEY', envModel: 'CEREBRAS_MODEL', type: 'openai-compatible' },
  fireworks: { label: 'Fireworks AI', defaultModel: 'accounts/fireworks/models/llama-v3p3-70b-instruct', baseUrl: 'https://api.fireworks.ai/inference/v1', envKey: 'FIREWORKS_API_KEY', envModel: 'FIREWORKS_MODEL', type: 'openai-compatible' },
  perplexity: { label: 'Perplexity', defaultModel: 'sonar', baseUrl: 'https://api.perplexity.ai', envKey: 'PERPLEXITY_API_KEY', envModel: 'PERPLEXITY_MODEL', type: 'openai-compatible' },
  cohere: { label: 'Cohere', defaultModel: 'command-a-03-2025', envKey: 'COHERE_API_KEY', envModel: 'COHERE_MODEL', type: 'cohere' },
  sambanova: { label: 'SambaNova', defaultModel: 'Meta-Llama-3.3-70B-Instruct', baseUrl: 'https://api.sambanova.ai/v1', envKey: 'SAMBANOVA_API_KEY', envModel: 'SAMBANOVA_MODEL', type: 'openai-compatible' },
  custom: { label: 'Custom OpenAI-compatible endpoint', defaultModel: '', type: 'openai-compatible' }
};

export const supportedAiProviders = () => Object.entries(AI_PROVIDERS).map(([id, value]) => ({
  id, label: value.label, defaultModel: value.defaultModel, type: value.type
}));

export const normalizeGeminiModel = (model) => {
  const value = String(model || '').trim();
  const legacy = new Set(['gemini-1.5-flash', 'gemini-1.5-flash-001', 'gemini-2.0-flash', 'gemini-2.0-flash-001', 'gemini-2.0-flash-lite', 'gemini-2.0-flash-lite-001']);
  return !value || legacy.has(value) ? 'gemini-3.8-flash' : value;
};

export const centralConfig = async () => {
  const stored = await getAiConfig();
  const secret = process.env.STUDYMATE_CONFIG_SECRET || '';
  if (stored?.encryptedApiKey && secret.length >= 32) {
    try {
      const key = crypto.createHash('sha256').update(secret).digest();
      const [ivHex, tagHex, dataHex] = stored.encryptedApiKey.split(':');
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
      decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
      const apiKey = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]).toString('utf8');
      if (apiKey) {
        const meta = AI_PROVIDERS[stored.provider] || AI_PROVIDERS.custom;
        return { provider: stored.provider, model: stored.provider === 'gemini' ? normalizeGeminiModel(stored.model) : (stored.model || meta.defaultModel), apiKey, endpoint: stored.endpoint || meta.baseUrl || '' };
      }
    } catch {}
  }
  for (const [provider, meta] of Object.entries(AI_PROVIDERS)) {
    if (!meta.envKey) continue;
    const apiKey = process.env[meta.envKey];
    if (apiKey) return { provider, model: meta.envModel && process.env[meta.envModel] ? process.env[meta.envModel] : meta.defaultModel, apiKey, endpoint: meta.baseUrl || '' };
  }
  return { provider: 'offline', model: '', apiKey: '', endpoint: '' };
};

export async function generateConfiguredCompletion({ system, user, temperature = 0.3, json = false }) {
  const config = await centralConfig();
  if (!config.apiKey || config.provider === 'offline') throw new Error('No administrator-configured AI provider is available.');

  const meta = AI_PROVIDERS[config.provider];
  if (!meta) throw new Error('Unsupported administrator-configured AI provider.');

  if (meta.type === 'gemini') {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + (config.model || meta.defaultModel) + ':generateContent';
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.apiKey },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { temperature, ...(json ? { responseMimeType: 'application/json' } : {}) }
      })
    });
    if (!response.ok) throw new Error('Configured Gemini provider rejected the request.');
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
    if (!text) throw new Error('Configured Gemini provider returned an empty response.');
    return { text, provider: config.provider, model: config.model };
  }

  if (meta.type === 'anthropic') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': config.apiKey, 'anthropic-version': '2023-06-01' },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({ model: config.model || meta.defaultModel, max_tokens: 4096, system, messages: [{ role: 'user', content: user }], temperature })
    });
    if (!response.ok) throw new Error('Configured Anthropic provider rejected the request.');
    const data = await response.json();
    const text = data?.content?.map((part) => part.text || '').join('').trim();
    if (!text) throw new Error('Configured Anthropic provider returned an empty response.');
    return { text, provider: config.provider, model: config.model };
  }

  if (meta.type === 'cohere') {
    const response = await fetch('https://api.cohere.com/v2/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + config.apiKey },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({ model: config.model || meta.defaultModel, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature })
    });
    if (!response.ok) throw new Error('Configured Cohere provider rejected the request.');
    const data = await response.json();
    const text = data?.message?.content?.map((part) => part.text || '').join('').trim();
    if (!text) throw new Error('Configured Cohere provider returned an empty response.');
    return { text, provider: config.provider, model: config.model };
  }

  const endpoint = (config.endpoint || meta.baseUrl || '').replace(/\/$/, '') + '/chat/completions';
  if (!endpoint.startsWith('https://')) throw new Error('A secure HTTPS AI endpoint is required.');
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + config.apiKey },
    signal: AbortSignal.timeout(20000),
    body: JSON.stringify({
      model: config.model || meta.defaultModel,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      temperature,
      ...(json ? { response_format: { type: 'json_object' } } : {})
    })
  });
  if (!response.ok) throw new Error('Configured ' + (meta.label || config.provider) + ' provider rejected the request.');
  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Configured ' + (meta.label || config.provider) + ' provider returned an empty response.');
  return { text, provider: config.provider, model: config.model };
}

export async function generateChatbotReply({ message, history = [], department = '', subject = 'General' }) {
  const config = await centralConfig();
  if (config.apiKey && config.provider !== 'offline') {
    try {
      const system = `You are StudyMate AI, the academic tutor and examination guide for KL University students in the Department of ${department}, focusing on ${subject}.
Answer clearly and accurately. Use equations and step-by-step logic when appropriate. Do not claim institutional exam rules, grading rubrics, marks requirements, or policies unless they are explicitly supplied by the user or administrator-published context. Use Markdown formatting.`;
      const result = await generateConfiguredCompletion({
        system,
        user: [...history.slice(-6).map(h => `${h.role}: ${h.content}`), `user: ${message}`].join('\n'),
        temperature: 0.3
      });
      return { content: result.text, provider: result.provider + (result.model ? ` (${result.model})` : ''), suggestedActions: extractSuggestions(message, subject, department) };
    } catch (err) {
      console.warn('AI chatbot call failed, using offline engine:', err.message);
    }
  }

function extractSuggestions(_message, subject, department) {
  return [
    { label: 'Generate notes for this subject', actionType: 'notes', payload: subject || '' },
    { label: 'Open the mock exam', actionType: 'mock-exam', payload: department || '' },
    { label: 'Practice active recall', actionType: 'flashcards', payload: subject || '' }
  ];
}

function generateOfflineTutorReply(_query, dept, subj) {
  return {
    content: `### StudyMate AI Tutor

The configured AI provider is currently unavailable.

I can still help you navigate your administrator-published **${subj || 'subject'}** in **${dept || 'your department'}**. Select a published subject, open its resources, or configure an AI provider from the administrator settings before requesting generated explanations.`,
    suggestedActions: extractSuggestions('', subj, dept)
  };
}
