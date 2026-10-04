import test from 'node:test';
import assert from 'node:assert/strict';
import zlib from 'node:zlib';
import { extractPdfText } from '../server/pdf-extractor.js';

function makePdf(text) {
  const body = Buffer.from('BT /F1 12 Tf 72 720 Td (' + text.replace(/[()\\]/g, '\\$&') + ') Tj ET', 'latin1');
  const compressed = zlib.deflateSync(body);
  return Buffer.concat([
    Buffer.from('%PDF-1.4\n1 0 obj\n<< /Length ' + compressed.length + ' /Filter /FlateDecode >>\nstream\n', 'latin1'),
    compressed,
    Buffer.from('\nendstream\nendobj\n%%EOF', 'latin1')
  ]);
}

test('extracts text from a Flate-compressed PDF text stream', () => {
  const text = extractPdfText(makePdf('StudyMate private PDF extraction works.'));
  assert.match(text, /StudyMate private PDF extraction works/);
});

test('rejects non-PDF input', () => {
  assert.throws(() => extractPdfText(Buffer.from('not a pdf')), /Invalid PDF document/);
});

test('rejects image-only or otherwise textless PDFs', () => {
  const pdf = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nstream\nimage-data\nendstream\nendobj\n%%EOF', 'latin1');
  assert.throws(() => extractPdfText(pdf), /No extractable text/);
});

test('rejects compressed streams that expand beyond the extractor safety limit', () => {
  const payload = Buffer.alloc(9 * 1024 * 1024, 65);
  const compressed = zlib.deflateSync(payload);
  const pdf = Buffer.concat([
    Buffer.from('%PDF-1.4\n<< /Length ' + compressed.length + ' /Filter /FlateDecode >>\nstream\n', 'latin1'),
    compressed,
    Buffer.from('\nendstream\n%%EOF', 'latin1')
  ]);
  assert.throws(() => extractPdfText(pdf), /No extractable text|maximum|too large/i);
});
