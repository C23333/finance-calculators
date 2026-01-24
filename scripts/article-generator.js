/**
 * Article Generator - Multi-stage AI pipeline (draft -> review -> polish)
 * Uses local CLI tools configured in config/ai-pipeline.json
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Import article history module for versioned generation
let articleHistory;
try {
  articleHistory = require('./article-history');
} catch (e) {
  articleHistory = null;
  console.log('Note: article-history module not available, version tracking disabled');
}

const PROJECT_ROOT = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'output');
const CONFIG_DIR = path.join(PROJECT_ROOT, 'config');

const DEFAULT_STAGE_CONFIG = {
  cliCommand: process.env.AI_CLI_COMMAND || 'claude',
  promptMode: 'stdin',
  extraArgs: ['--print'],
  timeout: 600000,
  delay: 3000
};

function loadPipelineConfig() {
  const pipelinePath = path.join(CONFIG_DIR, 'ai-pipeline.json');
  if (fs.existsSync(pipelinePath)) {
    try {
      return JSON.parse(fs.readFileSync(pipelinePath, 'utf-8'));
    } catch (e) {
      console.warn('Failed to parse ai-pipeline.json, using defaults');
    }
  }
  return {
    draft: { ...DEFAULT_STAGE_CONFIG },
    review: { ...DEFAULT_STAGE_CONFIG },
    polish: { ...DEFAULT_STAGE_CONFIG },
    fallback: { ...DEFAULT_STAGE_CONFIG }
  };
}

function loadPromptTemplate(fileName) {
  const filePath = path.join(CONFIG_DIR, 'prompts', fileName);
  return fs.readFileSync(filePath, 'utf-8');
}

function loadAffiliateConfig() {
  const configPath = path.join(CONFIG_DIR, 'affiliate-products.json');
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (err) {
    console.warn('Failed to load affiliate config:', err.message);
    return { topicMapping: {} };
  }
}

function getCalculatorForTopic(topic, affiliateConfig) {
  const mapping = affiliateConfig.topicMapping || {};
  const topicData = mapping[topic] || mapping.general || {};
  const calculators = topicData.calculators || [];
  return calculators.length > 0 ? calculators[0] : {
    name: 'Financial Calculator',
    path: '/calculators/',
    description: 'Explore our financial calculators'
  };
}

function getRelatedCalculators(topic, affiliateConfig) {
  const mapping = affiliateConfig.topicMapping || {};
  const topicData = mapping[topic] || mapping.general || {};
  return topicData.calculators || [];
}

function callAICLI(prompt, config) {
  const cliCommand = config.cliCommand || DEFAULT_STAGE_CONFIG.cliCommand;
  const extraArgs = Array.isArray(config.extraArgs) ? config.extraArgs : [];
  const timeout = config.timeout || DEFAULT_STAGE_CONFIG.timeout;
  const promptMode = config.promptMode || 'stdin';

  console.log(`  -> CLI: ${cliCommand}`);

  const tempFile = path.join(OUTPUT_DIR, 'temp-prompt.txt');
  fs.writeFileSync(tempFile, prompt, 'utf-8');

  let cmd = '';
  if (promptMode === 'file') {
    cmd = `${cliCommand} ${extraArgs.join(' ')} "${tempFile}"`;
  } else if (promptMode === 'arg') {
    const safePrompt = prompt.replace(/"/g, '\\"');
    cmd = `${cliCommand} ${extraArgs.join(' ')} "${safePrompt}"`;
  } else {
    cmd = `${cliCommand} ${extraArgs.join(' ')} < "${tempFile}"`;
  }

  try {
    const result = execSync(cmd, {
      encoding: 'utf-8',
      timeout: timeout,
      maxBuffer: 50 * 1024 * 1024,
      windowsHide: true,
      shell: true
    });

    return result;
  } catch (error) {
    console.error(`  CLI failed: ${error.message}`);
    return null;
  }
}

function buildStep1Prompt(article, template, calculator) {
  const newsSummary = `
**Title**: ${article.title}
**Source**: ${article.source}
**Published**: ${article.pubDate}
**Category**: ${article.topic}

**Summary**:
${article.description}

**Original Link**: ${article.link}
`;

  return template
    .replace('{NEWS_SUMMARY}', newsSummary)
    .replace('{TOPIC}', article.topic)
    .replace('{CALCULATOR}', calculator.name);
}

function buildStep2Prompt(draftContent, template) {
  return template.replace('{ARTICLE_DRAFT}', draftContent);
}

function buildStep3Prompt(reviewedContent, article, template, calculator, relatedCalculators) {
  const dateStr = new Date().toISOString().split('T')[0];
  return template
    .replace('{REVIEWED_ARTICLE}', reviewedContent)
    .replace('{TOPIC}', article.topic)
    .replace('{CATEGORY}', capitalizeFirst(article.topic || 'Finance'))
    .replace('{CALCULATOR}', calculator.name)
    .replace('{RELATED_CALCULATORS}', relatedCalculators.map(c => c.name).join(', '))
    .replace('{DATE}', dateStr)
    .replace('{SOURCE_TITLE}', article.title)
    .replace('{SOURCE_PUBLISHER}', article.source)
    .replace('{SOURCE_URL}', article.link)
    .replace('{SOURCE_DATE}', article.pubDate || dateStr);
}

function parseOutput(output) {
  if (!output) return null;
  let content = output.trim();

  if (content.startsWith('```json')) content = content.slice(7);
  if (content.startsWith('```')) content = content.slice(3);
  if (content.endsWith('```')) content = content.slice(0, -3);

  const jsonStart = content.indexOf('{');
  const jsonEnd = content.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1) {
    content = content.slice(jsonStart, jsonEnd + 1);
  }

  try {
    return JSON.parse(content);
  } catch (e) {
    console.error('  JSON parse failed:', e.message);
    return { raw: output, parseError: e.message };
  }
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60)
    .replace(/-$/, '');
}

function capitalizeFirst(str) {
  if (!str) return 'Finance';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateArticles(date, limit = 3) {
  const pipeline = loadPipelineConfig();
  const affiliateConfig = loadAffiliateConfig();

  const templates = {
    step1: loadPromptTemplate('step1-draft.md'),
    step2: loadPromptTemplate('step2-review.md'),
    step3: loadPromptTemplate('step3-polish.md')
  };

  console.log('============================================================');
  console.log('Article Generator - Multi-stage Pipeline');
  console.log('============================================================');
  console.log(`Date: ${date}`);
  console.log(`Count: ${limit}`);
  console.log();

  const newsPath = path.join(OUTPUT_DIR, 'news', `news-${date}.json`);
  if (!fs.existsSync(newsPath)) {
    console.error(`News file not found: ${newsPath}`);
    console.log('Run scripts/news-fetcher.js first.');
    return [];
  }

  const newsData = JSON.parse(fs.readFileSync(newsPath, 'utf-8'));
  const articles = (newsData.articles || [])
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, limit);

  if (articles.length === 0) {
    console.log('No articles found for generation');
    return [];
  }

  const articlesDir = path.join(OUTPUT_DIR, 'articles');
  const draftsDir = path.join(OUTPUT_DIR, 'drafts', date);
  [articlesDir, draftsDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  const results = [];

  for (let i = 0; i < articles.length; i++) {
    const newsItem = articles[i];
    const slug = generateSlug(newsItem.title);
    const filename = `final-${slug}.json`;
    const filepath = path.join(articlesDir, filename);

    console.log(`\n[${i + 1}/${articles.length}] ${newsItem.title.substring(0, 80)}...`);
    console.log('-'.repeat(60));

    if (articleHistory && articleHistory.isSlugUsed(slug)) {
      const currentVersion = articleHistory.getCurrentVersion(slug);
      console.log(`  Existing article detected: ${slug} (v${currentVersion})`);
      articleHistory.archiveVersion(slug);
      console.log('  Archived previous version');
    }

    const calculator = getCalculatorForTopic(newsItem.topic || 'general', affiliateConfig);
    const relatedCalculators = getRelatedCalculators(newsItem.topic || 'general', affiliateConfig);

    // Step 1: Draft
    console.log('Step 1: Draft');
    const step1Prompt = buildStep1Prompt(newsItem, templates.step1, calculator);
    const draftOutput = callAICLI(step1Prompt, pipeline.draft || pipeline.fallback || DEFAULT_STAGE_CONFIG);
    if (!draftOutput) {
      results.push({ success: false, title: newsItem.title, error: 'Draft failed' });
      continue;
    }
    fs.writeFileSync(path.join(draftsDir, `draft-${slug}.md`), draftOutput, 'utf-8');

    // Step 2: Review
    console.log('Step 2: Review');
    const step2Prompt = buildStep2Prompt(draftOutput, templates.step2);
    const reviewOutput = callAICLI(step2Prompt, pipeline.review || pipeline.fallback || DEFAULT_STAGE_CONFIG);
    if (!reviewOutput) {
      results.push({ success: false, title: newsItem.title, error: 'Review failed' });
      continue;
    }
    fs.writeFileSync(path.join(draftsDir, `review-${slug}.md`), reviewOutput, 'utf-8');

    // Step 3: Final JSON
    console.log('Step 3: Final JSON');
    const step3Prompt = buildStep3Prompt(reviewOutput, newsItem, templates.step3, calculator, relatedCalculators);
    const finalOutput = callAICLI(step3Prompt, pipeline.polish || pipeline.fallback || DEFAULT_STAGE_CONFIG);
    if (!finalOutput) {
      results.push({ success: false, title: newsItem.title, error: 'Polish failed' });
      continue;
    }

    const articleData = parseOutput(finalOutput);
    fs.writeFileSync(filepath, JSON.stringify(articleData, null, 2), 'utf-8');

    if (articleHistory) {
      articleHistory.recordArticle({
        slug,
        sourceUrl: newsItem.link,
        title: newsItem.title,
        generatedAt: new Date().toISOString()
      });
    }

    console.log(`  Saved: ${filename}`);
    results.push({ success: true, filename, title: newsItem.title, slug });

    if (i < articles.length - 1 && DEFAULT_STAGE_CONFIG.delay > 0) {
      console.log(`Waiting ${DEFAULT_STAGE_CONFIG.delay / 1000}s...`);
      await sleep(DEFAULT_STAGE_CONFIG.delay);
    }
  }

  console.log('\n============================================================');
  console.log('Generation Summary');
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  console.log(`  Success: ${successCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log('============================================================');

  return results;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const date = args[0] || new Date().toISOString().split('T')[0];
  const limit = parseInt(args[1], 10) || 3;

  generateArticles(date, limit)
    .then(results => {
      if (results.filter(r => r.success).length === 0) process.exit(1);
    })
    .catch(err => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}

module.exports = { generateArticles, parseOutput };
