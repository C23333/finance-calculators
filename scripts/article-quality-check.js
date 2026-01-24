#!/usr/bin/env node
/**
 * Article Quality Check
 * Validates generated JSON for required fields and basic quality gates
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const ARTICLES_DIR = path.join(PROJECT_ROOT, 'output', 'articles');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'output');

const DEFAULT_MIN_SECTIONS = 3;
const DEFAULT_MIN_TAKEAWAYS = 3;
const DEFAULT_MIN_WORDS = 800;

function listArticleFiles() {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  const files = [];
  const walk = dir => {
    fs.readdirSync(dir).forEach(item => {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) return walk(full);
      if (item.startsWith('final-') && item.endsWith('.json')) files.push(full);
    });
  };
  walk(ARTICLES_DIR);
  return files;
}

function loadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    return { __parseError: err.message };
  }
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function checkArticle(article, filePath) {
    const errors = [];
    const warnings = [];

  if (article.__parseError) {
    errors.push(`JSON parse error: ${article.__parseError}`);
    return { filePath, errors, warnings };
  }

  const metadata = article.metadata || {};
  const content = article.content || {};

  const requiredMeta = [
    'title',
    'metaDescription',
    'slug',
    'category',
    'primaryKeyword',
    'readingTime',
    'publishDate',
    'modifiedDate',
    'author',
    'reviewedBy',
    'aiAssisted',
    'disclosure',
    'methodology'
  ];

  requiredMeta.forEach(field => {
    if (field === 'aiAssisted') {
      if (metadata.aiAssisted !== true) errors.push('metadata.aiAssisted must be true');
      return;
    }
    if (!hasText(metadata[field])) errors.push(`missing metadata.${field}`);
  });

  if (!hasText(content.headline)) errors.push('missing content.headline');
  if (!hasText(content.intro)) errors.push('missing content.intro');
  if (!hasText(content.conclusion)) errors.push('missing content.conclusion');

    const sections = Array.isArray(content.sections) ? content.sections : [];
    if (sections.length < DEFAULT_MIN_SECTIONS) errors.push(`content.sections < ${DEFAULT_MIN_SECTIONS}`);

    const takeaways = Array.isArray(content.keyTakeaways) ? content.keyTakeaways : [];
    if (takeaways.length < DEFAULT_MIN_TAKEAWAYS) errors.push(`content.keyTakeaways < ${DEFAULT_MIN_TAKEAWAYS}`);

    const wordCount = sections.reduce((total, section) => {
      const headingWords = section.heading ? section.heading.split(/\s+/).length : 0;
      const contentText = section.content ? section.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
      const contentWords = contentText ? contentText.split(/\s+/).length : 0;
      return total + headingWords + contentWords;
    }, 0);

    if (wordCount < DEFAULT_MIN_WORDS) warnings.push(`word count low (${wordCount})`);

  const sources = Array.isArray(article.sources) ? article.sources : [];
  if (sources.length < 1) errors.push('sources missing');
  sources.forEach((source, idx) => {
    if (!hasText(source.title)) errors.push(`sources[${idx}].title missing`);
    if (!hasText(source.publisher)) errors.push(`sources[${idx}].publisher missing`);
    if (!hasText(source.url)) errors.push(`sources[${idx}].url missing`);
    if (!hasText(source.accessDate)) warnings.push(`sources[${idx}].accessDate missing`);
  });

  const contentBlob = JSON.stringify(article).toLowerCase();
  const bannedPhrases = ['as an ai', 'i am an ai', 'language model', 'lorem ipsum', 'todo'];
  bannedPhrases.forEach(phrase => {
    if (contentBlob.includes(phrase)) warnings.push(`contains banned phrase: ${phrase}`);
  });

  return { filePath, errors, warnings };
}

function main() {
  const files = listArticleFiles();
  if (files.length === 0) {
    console.log('No article files found for quality check.');
    process.exit(1);
  }

  const results = files.map(file => checkArticle(loadJson(file), file));
  const failed = results.filter(r => r.errors.length > 0);
  const warnings = results.filter(r => r.warnings.length > 0);

  const report = {
    checkedAt: new Date().toISOString(),
    total: results.length,
    failed: failed.length,
    warnings: warnings.length,
    results: results.map(r => ({
      file: path.relative(PROJECT_ROOT, r.filePath),
      errors: r.errors,
      warnings: r.warnings
    }))
  };

  const reportPath = path.join(OUTPUT_DIR, `quality-report-${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`Quality report saved: ${reportPath}`);
  console.log(`Failures: ${failed.length} | Warnings: ${warnings.length}`);

  if (failed.length > 0) process.exit(1);
}

if (require.main === module) {
  main();
}

module.exports = { main };
