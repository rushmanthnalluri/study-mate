import zlib from 'zlib';

const MAX_OUTPUT_CHARS = 100000;
const MAX_STREAM_BYTES = 8 * 1024 * 1024;

function decodePdfString(raw) {
  if (raw.startsWith('<') && raw.endsWith('>')) {
    const hex = raw.slice(1, -1).replace(/\s+/g, '');
    const padded = hex.length % 2 ? hex + '0' : hex;
    try { return Buffer.from(padded, 'hex').toString('utf8'); } catch { return ''; }
  }
  if (!raw.startsWith('(') || !raw.endsWith(')')) return '';
  const body = raw.slice(1, -1);
  let out = '';
  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i];
    if (ch !== '\\') { out += ch; continue; }
    const next = body[++i];
    if (next === undefined) break;
    const escapes = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', '(': '(', ')': ')', '\\': '\\' };
    if (escapes[next] !== undefined) out += escapes[next];
    else if (/^[0-7]$/.test(next)) {
      let oct = next;
      for (let j = 0; j < 2 && /^[0-7]$/.test(body[i + 1] || ''); j += 1) oct += body[++i];
      out += String.fromCharCode(parseInt(oct, 8));
    } else out += next;
  }
  return out;
}

function extractTextOperators(stream) {
  const pieces = [];
  const token = /\((?:\\.|[^\\()])*\)|<([0-9A-Fa-f\s]+)>/g;
  let match;
  while ((match = token.exec(stream))) {
    const end = token.lastIndex;
    const tail = stream.slice(end, Math.min(stream.length, end + 12));
    const value = decodePdfString(match[0]);
    if (!value) continue;
    if (/^\s*Tj\b/.test(tail) || /^\s*TJ\b/.test(tail)) pieces.push(value);
  }
  return pieces;
}

function inflateStream(bytes, dictionary) {
  if (!/\/FlateDecode(?:\s|\/|$)/.test(dictionary)) return bytes;
  try {
    return zlib.inflateSync(bytes, { maxOutputLength: MAX_STREAM_BYTES });
  } catch {
    try { return zlib.inflateRawSync(bytes); } catch { return Buffer.alloc(0); }
  }
}

function extractFromStream(streamBytes, dictionary) {
  if (streamBytes.length > MAX_STREAM_BYTES) return '';
  const decoded = inflateStream(streamBytes, dictionary);
  if (!decoded.length) return '';
  return extractTextOperators(decoded.toString('latin1')).join(' ');
}

export function extractPdfText(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 5 || buffer.subarray(0, 5).toString('latin1') !== '%PDF-') {
    throw new Error('Invalid PDF document.');
  }

  const source = buffer.toString('latin1');
  const chunks = [];
  const streamPattern = /((?:<<[\s\S]*?>>))\s*stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match;
  while ((match = streamPattern.exec(source))) {
    const dictionary = match[1];
    const rawStart = match.index + match[0].indexOf(match[2]);
    const rawEnd = rawStart + match[2].length;
    const text = extractFromStream(buffer.subarray(rawStart, rawEnd), dictionary);
    if (text) chunks.push(text);
    if (chunks.join(' ').length >= MAX_OUTPUT_CHARS) break;
  }

  const text = chunks.join('\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!text) throw new Error('No extractable text was found. This PDF may be scanned or image-only.');
  return text.slice(0, MAX_OUTPUT_CHARS);
}
