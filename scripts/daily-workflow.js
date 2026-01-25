#!/usr/bin/env node
/**
 * Daily Workflow Orchestrator
 * Coordinates the entire article generation pipeline
 *
 * Steps:
 * 0. RSS Source Health Check
 * 1. Fetch News
 * 2. Generate Prompts (optional)
 * 3. AI Article Generation (draft -> review -> polish)
 * 4. Quality Check
 * 5. Build HTML
 * 6. Update Sitemap
 * 7. Review & Publish
 */

const { execSync } = require('child_process');
const path = require('path');
const readline = require('readline');

const SCRIPTS_DIR = __dirname;
const PROJECT_ROOT = path.join(__dirname, '..');

function runScript(scriptName, args = []) {
  const scriptPath = path.join(SCRIPTS_DIR, scriptName);
  console.log(`\n> Running ${scriptName}...`);
  console.log('-'.repeat(40));

  try {
    execSync(`node "${scriptPath}" ${args.join(' ')}`, {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: 'inherit'
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.toLowerCase());
    });
  });
}

function stepHeader(stepNum, title) {
  console.log('\n' + '='.repeat(60));
  console.log(`Step ${stepNum}: ${title}`);
  console.log('='.repeat(60));
}

async function main() {
  const args = process.argv.slice(2);
  const skipFetch = args.includes('--skip-fetch');
  const skipPrompts = args.includes('--skip-prompts');
  const skipHealthCheck = args.includes('--skip-health');
  const autoMode = args.includes('--auto');
  const articleCount = parseInt(args.find(a => /^\d+$/.test(a)), 10) || 5;

  console.log('============================================================');
  console.log('FinCalc Daily Content Generation Workflow');
  console.log('============================================================');
  console.log(`Date: ${new Date().toISOString().split('T')[0]}`);
  console.log(`Article target: ${articleCount}`);

  // Step 0: RSS Source Health Check
  if (!skipHealthCheck && !skipFetch) {
    stepHeader(0, 'RSS Source Health Check');
    const healthResult = runScript('source-health-check.js');

    if (!healthResult.success) {
      console.error('Health check failed. Some RSS sources may be unavailable.');
      if (!autoMode) {
        const cont = await prompt('Continue with available sources? (y/n): ');
        if (cont !== 'y') process.exit(1);
      }
    }
  } else if (skipHealthCheck) {
    console.log('\nSkipping health check (--skip-health)');
  }

  // Step 1: Fetch News
  if (!skipFetch) {
    stepHeader(1, 'Fetch Financial News');
    const fetchResult = runScript('news-fetcher.js');

    if (!fetchResult.success) {
      console.error('News fetching failed. Check your internet connection.');
      if (!autoMode) {
        const cont = await prompt('Continue anyway? (y/n): ');
        if (cont !== 'y') process.exit(1);
      }
    }
  } else {
    console.log('\nSkipping news fetch (--skip-fetch)');
  }

  // Step 2: Generate Prompts (optional/manual)
  if (!skipPrompts) {
    stepHeader(2, 'Generate AI Prompts (optional)');
    const promptResult = runScript('prompt-generator.js', [articleCount.toString()]);

    if (!promptResult.success) {
      console.error('Prompt generation failed.');
      process.exit(1);
    }
  } else {
    console.log('\nSkipping prompt generation (--skip-prompts)');
  }

  // Step 3: AI Article Generation (multi-stage pipeline)
  stepHeader(3, 'AI Article Generation (Draft -> Review -> Polish)');
  const genResult = runScript('article-generator.js', [
    new Date().toISOString().split('T')[0],
    articleCount.toString()
  ]);

  if (!genResult.success) {
    console.error('Article generation failed.');
    if (!autoMode) {
      const cont = await prompt('Continue to quality check? (y/n): ');
      if (cont !== 'y') process.exit(1);
    }
  }

  // Step 4: Quality Check
  stepHeader(4, 'Quality Check (Schema + Sources)');
  const qualityResult = runScript('article-quality-check.js', [
    '--date',
    new Date().toISOString().split('T')[0]
  ]);
  if (!qualityResult.success) {
    console.error('Quality check failed. Fix issues before publishing.');
    if (!autoMode) {
      const cont = await prompt('Continue anyway? (y/n): ');
      if (cont !== 'y') process.exit(1);
    }
  }

  // Step 5: Build HTML
  stepHeader(5, 'Build HTML Articles');
  const buildResult = runScript('html-builder.js');

  if (!buildResult.success) {
    console.error('HTML building failed.');
    if (!autoMode) {
      const cont = await prompt('Continue anyway? (y/n): ');
      if (cont !== 'y') process.exit(1);
    }
  }

  // Step 6: Update Sitemap
  stepHeader(6, 'Update Sitemap & Blog Index');
  const sitemapResult = runScript('sitemap-updater.js');
  if (!sitemapResult.success) {
    console.error('Sitemap update failed.');
  }

  // Step 7: Review & Publish
  stepHeader(7, 'Review & Publish');
  if (!autoMode) {
    console.log('\nPlease review the generated articles before publishing.');
    console.log('Articles are located in: blog/\n');

    const review = await prompt('Have you reviewed the articles? (y/n): ');
    if (review !== 'y') {
      console.log('Please review articles before publishing.');
      console.log('Run "node scripts/publish.js" when ready.');
      return;
    }

    const publish = await prompt('Publish to live site? (y/n): ');
    if (publish === 'y') {
      runScript('publish.js', ['--force']);
    } else {
      console.log('\nTo publish later, run:');
      console.log('  node scripts/publish.js');
    }
  }

  console.log('\n============================================================');
  console.log('Workflow Complete');
  console.log('============================================================');
  console.log(`\nSummary:
  - Health check: ${skipHealthCheck || skipFetch ? 'Skipped' : 'Yes'}
  - News fetched: ${skipFetch ? 'Skipped' : 'Yes'}
  - Prompts generated: ${skipPrompts ? 'Skipped' : 'Yes'}
  - Quality check: ${qualityResult?.success ? 'Pass' : 'Check errors'}
  - HTML built: ${buildResult?.success ? 'Yes' : 'Check errors'}
  - Sitemap updated: ${sitemapResult?.success ? 'Yes' : 'Check errors'}

Output locations:
  - Health report: output/health-report.json
  - News data: output/news/
  - AI prompts: output/prompts/
  - Article drafts: output/drafts/
  - Final articles: output/articles/
  - OG images: blog/images/og/
  - Published HTML: blog/
  - Quality report: output/quality-report-YYYY-MM-DD.json
`);
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Daily Workflow Orchestrator

Usage: node daily-workflow.js [options] [article-count]

Options:
  --skip-fetch    Skip news fetching step (also skips health check)
  --skip-prompts  Skip prompt generation step
  --skip-health   Skip RSS source health check step
  --auto          Run in non-interactive mode
  --help, -h      Show this help message

Arguments:
  article-count   Number of articles to generate (default: 5)

Workflow Steps:
  0. RSS Source Health Check
  1. Fetch News
  2. Generate Prompts (optional)
  3. AI Article Generation (draft -> review -> polish)
  4. Quality Check
  5. Build HTML
  6. Update Sitemap
  7. Review & Publish

Examples:
  node daily-workflow.js
  node daily-workflow.js 3
  node daily-workflow.js --skip-fetch
  node daily-workflow.js --auto
`);
  process.exit(0);
}

main().catch(err => {
  console.error('Workflow error:', err.message);
  process.exit(1);
});
