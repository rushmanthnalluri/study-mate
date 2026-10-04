import { generateConfiguredCompletion } from './chatbot.js';

const stripCodeFence = (value) => value
  .replace(/^\`\`\`(?:json)?\s*/i, '')
  .replace(/\s*\`\`\`$/i, '')
  .trim();

const parseNote = (text) => {
  const parsed = JSON.parse(stripCodeFence(text));
  if (!parsed || typeof parsed !== 'object') throw new Error('AI returned an invalid note.');
  const required = ['topic', 'subject', 'department', 'code', 'unit', 'keywords', 'twoMarks', 'fiveMarks', 'tenMarks', 'diagram'];
  for (const key of required) {
    if (!(key in parsed)) throw new Error('AI response is missing note field: ' + key);
  }
  if (!Array.isArray(parsed.keywords)) throw new Error('AI response has invalid keywords.');
  return parsed;
};

/**
 * Generate an exam note from the administrator-published subject context.
 * No bundled subject answers or fabricated curriculum are used.
 */
export async function generateKLNotes({ department, subject, topic, subjectMeta }) {
  if (!department || !subject || !topic) throw new Error('Department, subject and topic are required.');
  if (!subjectMeta) throw new Error('Subject context is required.');

  const resources = Array.isArray(subjectMeta.resources) ? subjectMeta.resources : [];
  const units = Array.isArray(subjectMeta.units) ? subjectMeta.units : [];
  const resourceContext = resources.slice(0, 12).map((resource) => ({
    title: resource.title,
    type: resource.resourceType,
    description: resource.description,
    unit: resource.unit,
    fileName: resource.fileName
  }));

  const system = [
    'You are StudyMate, an academic note generator.',
    'Use only the supplied administrator-published subject context.',
    'Never invent departments, subject codes, units, resources, faculty, marks patterns, institutional policies, or facts that are not supported by the supplied context.',
    'Return ONLY valid JSON. No Markdown fences and no commentary.',
    'The JSON must contain topic, subject, department, code, unit, keywords, twoMarks, fiveMarks, tenMarks, diagram.',
    'twoMarks, fiveMarks and tenMarks each contain question and answer strings.',
    'diagram contains type and code strings; use type "mermaid" only when a useful diagram can be grounded in the supplied material.',
    'If the supplied material is insufficient for a claim, say that the administrator-published material does not provide enough information rather than guessing.'
  ].join(' ');

  const user = JSON.stringify({
    requestedTopic: topic,
    subject: {
      name: subjectMeta.name,
      code: subjectMeta.code,
      department: subjectMeta.department,
      description: subjectMeta.description,
      units
    },
    publishedResources: resourceContext
  });

  const result = await generateConfiguredCompletion({ system, user, temperature: 0.2 });
  const note = parseNote(result.text);

  note.topic = topic;
  note.subject = subjectMeta.name;
  note.department = subjectMeta.department;
  note.code = subjectMeta.code || note.code || '';
  note.resourcesUsed = resourceContext;
  note.provider = result.provider;

  return note;
}
