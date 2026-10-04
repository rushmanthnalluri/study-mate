/**
 * StudyMate AI Chatbot Engine
 * Supports online Groq / Gemini inference or smart offline academic tutoring grounded in KL University curriculum.
 */

import crypto from 'crypto';
import { getAiConfig } from './db.js';

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
      if (apiKey) return { provider: stored.provider, model: stored.model || '', apiKey };
    } catch {}
  }
  if (process.env.GEMINI_API_KEY) return { provider: 'gemini', model: process.env.GEMINI_MODEL || 'gemini-1.5-flash', apiKey: process.env.GEMINI_API_KEY };
  if (process.env.GROQ_API_KEY) return { provider: 'groq', model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile', apiKey: process.env.GROQ_API_KEY };
  return { provider: 'offline', model: '', apiKey: '' };
};

export async function generateConfiguredCompletion({ system, user, temperature = 0.3 }) {
  const config = await centralConfig();
  if (!config.apiKey || config.provider === 'offline') {
    throw new Error('No administrator-configured AI provider is available.');
  }

  if (config.provider === 'groq') {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + config.apiKey },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        model: config.model || 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
        temperature
      })
    });
    if (!response.ok) throw new Error('Configured Groq provider rejected the request.');
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Configured Groq provider returned an empty response.');
    return { text, provider: 'groq' };
  }

  if (config.provider === 'gemini') {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
      (config.model || 'gemini-1.5-flash') + ':generateContent?key=' + encodeURIComponent(config.apiKey);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { temperature }
      })
    });
    if (!response.ok) throw new Error('Configured Gemini provider rejected the request.');
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
    if (!text) throw new Error('Configured Gemini provider returned an empty response.');
    return { text, provider: 'gemini' };
  }

  throw new Error('Unsupported administrator-configured AI provider.');
}

export async function generateChatbotReply({ message, history = [], department = '', subject = 'General' }) {
  const config = await centralConfig();
  const apiKey = config.apiKey;
  const provider = config.provider;
  const model = config.model;

  // Try Online Groq
  if (provider === 'groq' && apiKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          model: model || 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are StudyMate AI, the academic tutor and examination guide for KL University students in the Department of ${department}, focusing on ${subject}.
Answer clearly and authoritatively with academic precision. Use equations, step-by-step logic, and specific KL exam tips (e.g. 2M definition format, 5M comparison tables, 10M flowcharts and Critical Control Points). Use Markdown formatting.`
            },
            ...history.slice(-6).map(h => ({ role: h.role, content: h.content })),
            { role: 'user', content: message }
          ],
          temperature: 0.3
        })
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data.choices[0].message.content;
        return {
          content: replyText,
          provider: 'groq (llama-3.3-70b)',
          suggestedActions: extractSuggestions(message, subject, department)
        };
      }
    } catch (err) {
      console.warn('Groq chatbot call failed, using offline engine:', err.message);
    }
  }

  // Try Online Gemini
  if (provider === 'gemini' && apiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: `You are StudyMate AI, an expert KL University engineering professor for ${department} (${subject}). Explain concepts, clarify doubts, solve numerical problems, and provide exam tips for 2M, 5M, and 10M questions. Use Markdown.` }]
          },
          contents: [
            ...history.slice(-4).map(h => ({
              role: h.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: h.content }]
            })),
            { role: 'user', parts: [{ text: message }] }
          ],
          generationConfig: { temperature: 0.3 }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data.candidates[0].content.parts[0].text;
        return {
          content: replyText,
          provider: 'gemini (1.5-flash)',
          suggestedActions: extractSuggestions(message, subject, department)
        };
      }
    } catch (err) {
      console.warn('Gemini chatbot call failed, using offline engine:', err.message);
    }
  }

  // Smart Academic Offline Tutor
  const reply = generateOfflineTutorReply(message, department, subject);
  return {
    content: reply.content,
    provider: 'StudyMate Offline Knowledge Engine',
    suggestedActions: reply.suggestedActions
  };
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
