#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const inputArg = process.argv[2] || 'about.json';
const outFile = path.join(__dirname, '..', 'src', 'content', 'about', '-index.md');
process.loadEnvFile?.(path.join(__dirname, '..', '.env'));

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET;

if (!projectId || !dataset) {
  console.error('Missing PUBLIC_SANITY_PROJECT_ID or PUBLIC_SANITY_DATASET in .env');
  process.exit(1);
}

if (!fs.existsSync(inputArg)) {
  console.error('Input file not found:', inputArg);
  process.exit(1);
}

const doc = JSON.parse(fs.readFileSync(inputArg, 'utf8'));

function slugify(s) {
  return ('' + s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function imageUrlFromRef(ref) {
  if (!ref) return null;
  // ref example: image-<assetId>-<width>x<height>-jpg
  const m = ref.match(/^image-([a-f0-9]+)-.*-(\w+)$/);
  if (!m) return null;
  const assetId = m[1];
  const ext = m[2];
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${assetId}.${ext}`;
}

function convertPortableText(blocks) {
  if (!Array.isArray(blocks)) return '';
  let out = '';
  for (const blk of blocks) {
    if (blk._type === 'block') {
      const text = (blk.children || []).map(c => c.text || '').join('');
      const style = blk.style || 'normal';
      if (style === 'h1') out += `# ${text}\n\n`;
      else if (style === 'h2') out += `## ${text}\n\n`;
      else if (style === 'h3') out += `### ${text}\n\n`;
      else out += `${text}\n\n`;
    } else if (blk._type === 'image') {
      const ref = blk.asset && (blk.asset._ref || blk.asset._id || blk.asset);
      const url = imageUrlFromRef(ref);
      out += url ? `![](${url})\n\n` : `<!-- image ${JSON.stringify(blk)} -->\n\n`;
    } else {
      out += `<!-- unknown block type ${blk._type} -->\n\n`;
    }
  }
  return out.trim() + '\n';
}

const title = doc.title || 'About';
const description = doc.description || '';
const imageRef = doc.image && doc.image.asset && (doc.image.asset._ref || doc.image.asset._id || doc.image.asset);
const image = imageUrlFromRef(imageRef);
const body = convertPortableText(doc.body || []);

const frontmatter = [
  '---',
  `title: ${title}`,
  description ? `description: ${description}` : null,
  image ? `image: ${image}` : null,
  '---',
  ''
].filter(Boolean).join('\n');

if (!fs.existsSync(path.dirname(outFile))) fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, frontmatter + '\n' + body, 'utf8');
console.log('Wrote', outFile);
