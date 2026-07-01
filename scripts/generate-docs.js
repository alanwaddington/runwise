#!/usr/bin/env node
// Converts every .md in docs/Guides/**/ to .html and .pdf alongside it.
// Run: node scripts/generate-docs.js
// Or:  npm run docs:generate

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import PDFDocument from 'pdfkit';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const GUIDES_DIR = join(ROOT, 'docs', 'Guides');

const HTML_STYLE = `
  body { font-family: system-ui, sans-serif; max-width: 860px; margin: 40px auto; padding: 0 24px;
         color: #19191a; line-height: 1.6; }
  h1 { font-size: 2rem; font-weight: 700; border-bottom: 2px solid #1b8a5a; padding-bottom: 8px; }
  h2 { font-size: 1.25rem; font-weight: 600; margin-top: 2rem; }
  h3 { font-size: 1rem; font-weight: 600; margin-top: 1.5rem; }
  code, pre { font-family: 'IBM Plex Mono', monospace; background: #f4f4f0; padding: 2px 6px;
               border-radius: 4px; font-size: 0.875em; }
  pre { padding: 12px 16px; overflow-x: auto; }
  pre code { background: none; padding: 0; }
  table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
  th, td { border: 1px solid #e0e0dc; padding: 8px 12px; text-align: left; }
  th { background: #f4f4f0; font-weight: 600; }
  hr { border: none; border-top: 1px solid #e0e0dc; margin: 2rem 0; }
  a { color: #1b8a5a; }
  @media (prefers-color-scheme: dark) {
    body { background: #19191a; color: #fafaf8; }
    code, pre, th { background: #2a2a2b; }
    th, td { border-color: #3a3a3b; }
    hr { border-color: #3a3a3b; }
  }
`;

function findMarkdownFiles(dir) {
	const results = [];
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) results.push(...findMarkdownFiles(full));
		else if (entry.endsWith('.md')) results.push(full);
	}
	return results;
}

function toHtml(mdPath, mdContent) {
	const title = basename(mdPath, '.md').replace(/-/g, ' ');
	const body = marked.parse(mdContent);
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>${HTML_STYLE}</style>
</head>
<body>${body}</body>
</html>`;
}

function toPdf(mdPath, mdContent, outPath) {
	const doc = new PDFDocument({ margin: 60, size: 'A4' });
	const chunks = [];
	doc.on('data', (c) => chunks.push(c));
	doc.on('end', () => writeFileSync(outPath, Buffer.concat(chunks)));

	const ACCENT = '#1b8a5a';
	const INK = '#19191a';
	const MUTED = '#555555';

	const lines = mdContent.split('\n');
	let inCode = false;
	let codeBuffer = [];

	function flushCode() {
		if (!codeBuffer.length) return;
		doc.font('Courier').fontSize(9).fillColor(INK);
		doc.rect(doc.x, doc.y, doc.page.width - 120, codeBuffer.length * 13 + 12)
			.fill('#f4f4f0').stroke('#e0e0dc');
		doc.moveDown(0.3);
		for (const line of codeBuffer) {
			doc.fillColor(INK).text(line || ' ', { indent: 8 });
		}
		codeBuffer = [];
		doc.moveDown(0.5);
	}

	for (const raw of lines) {
		const line = raw.trimEnd();

		if (line.startsWith('```')) {
			if (inCode) { flushCode(); inCode = false; }
			else inCode = true;
			continue;
		}
		if (inCode) { codeBuffer.push(line); continue; }

		if (line.startsWith('# ')) {
			doc.font('Helvetica-Bold').fontSize(22).fillColor(ACCENT)
				.text(line.slice(2), { underline: false });
			doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - 60, doc.y)
				.stroke(ACCENT);
			doc.moveDown(0.5);
		} else if (line.startsWith('## ')) {
			doc.moveDown(0.5).font('Helvetica-Bold').fontSize(14).fillColor(INK)
				.text(line.slice(3));
			doc.moveDown(0.2);
		} else if (line.startsWith('### ')) {
			doc.moveDown(0.3).font('Helvetica-Bold').fontSize(11).fillColor(INK)
				.text(line.slice(4));
		} else if (line.startsWith('---')) {
			doc.moveDown(0.3).moveTo(60, doc.y).lineTo(doc.page.width - 60, doc.y)
				.stroke('#e0e0dc').moveDown(0.3);
		} else if (line.startsWith('- ') || line.startsWith('* ')) {
			const text = line.slice(2).replace(/\*\*(.+?)\*\*/g, '$1');
			doc.font('Helvetica').fontSize(10).fillColor(INK)
				.text(`• ${text}`, { indent: 12 });
		} else if (line.match(/^\d+\./)) {
			const text = line.replace(/^\d+\.\s*/, '').replace(/\*\*(.+?)\*\*/g, '$1');
			doc.font('Helvetica').fontSize(10).fillColor(INK)
				.text(text, { indent: 12 });
		} else if (line === '') {
			doc.moveDown(0.4);
		} else if (line.startsWith('|')) {
			// Skip table rows — tables render poorly in pdfkit; handled below
		} else {
			const text = line.replace(/\*\*(.+?)\*\*/g, '$1').replace(/`(.+?)`/g, '$1');
			doc.font('Helvetica').fontSize(10).fillColor(INK).text(text);
		}
	}

	doc.end();
}

const files = findMarkdownFiles(GUIDES_DIR);
let count = 0;

for (const mdPath of files) {
	const md = readFileSync(mdPath, 'utf8');

	// HTML
	const htmlPath = mdPath.replace(/\.md$/, '.html');
	writeFileSync(htmlPath, toHtml(mdPath, md), 'utf8');

	// PDF
	const pdfPath = mdPath.replace(/\.md$/, '.pdf');
	toPdf(mdPath, md, pdfPath);

	console.log(`✓ ${mdPath.replace(ROOT + '/', '')}`);
	count++;
}

console.log(`\nGenerated HTML + PDF for ${count} guide(s).`);
