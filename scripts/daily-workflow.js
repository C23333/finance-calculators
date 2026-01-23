#!/usr/bin/env node
/**
 * Daily Workflow Orchestrator
 * Coordinates the entire article generation pipeline
 *
 * Steps:
 * 0. RSS Source Health Check (new)
 * 1. Fetch News
 * 2. Generate Prompts
 * 3. AI Article Generation
 * 4. Build HTML (with OG images & internal links)
 * 5. Update Sitemap
 * 6. Review & Publish
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Paths
const SCRIPTS_DIR = __dirname;
const PROJECT_ROOT = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'output');

/**
 * Run a script and return the result
 */
function runScript(scriptName, args = []) {
    const scriptPath = path.join(SCRIPTS_DIR, scriptName);
    console.log(`\n> Running ${scriptName}...`);
    console.log('-'.repeat(40));

    try {
        const result = execSync(`node "${scriptPath}" ${args.join(' ')}`, {
            cwd: PROJECT_ROOT,
            encoding: 'utf8',
            stdio: 'inherit'
        });
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

/**
 * Prompt user
 */
function prompt(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer.toLowerCase());
        });
    });
}

/**
 * Display step header
 */
function stepHeader(stepNum, title) {
    console.log('\n' + '='.repeat(60));
    console.log(`Step ${stepNum}: ${title}`);
    console.log('='.repeat(60));
}

/**
 * Main workflow
 */
async function main() {
    const args = process.argv.slice(2);
    const skipFetch = args.includes('--skip-fetch');
    const skipPrompts = args.includes('--skip-prompts');
    const skipHealthCheck = args.includes('--skip-health');
    const autoMode = args.includes('--auto');
    const articleCount = parseInt(args.find(a => /^\d+$/.test(a))) || 5;

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     FinCalc Daily Content Generation Workflow              ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\nDate: ${new Date().toISOString().split('T')[0]}`);
    console.log(`Article target: ${articleCount}`);
    console.log();

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

    // Step 2: Generate Prompts
    if (!skipPrompts) {
        stepHeader(2, 'Generate AI Prompts');
        const promptResult = runScript('prompt-generator.js', [articleCount.toString()]);

        if (!promptResult.success) {
            console.error('Prompt generation failed.');
            process.exit(1);
        }
    } else {
        console.log('\nSkipping prompt generation (--skip-prompts)');
    }

    // Step 3: AI Article Generation (自动调用 CLI)
    stepHeader(3, 'AI Article Generation');
    console.log('正在调用 Claude CLI 自动生成文章...\n');

    const genResult = runScript('article-generator.js', [
        new Date().toISOString().split('T')[0],
        articleCount.toString()
    ]);

    if (!genResult.success) {
        console.error('文章生成失败。');
        if (!autoMode) {
            const cont = await prompt('继续下一步？(y/n): ');
            if (cont !== 'y') process.exit(1);
        }
    }

    // Step 4: Build HTML
    stepHeader(4, 'Build HTML Articles');
    const buildResult = runScript('html-builder.js');

    if (!buildResult.success) {
        console.error('HTML building failed.');
        if (!autoMode) {
            const cont = await prompt('Continue anyway? (y/n): ');
            if (cont !== 'y') process.exit(1);
        }
    }

    // Step 5: Update Sitemap
    stepHeader(5, 'Update Sitemap & Blog Index');
    const sitemapResult = runScript('sitemap-updater.js');

    if (!sitemapResult.success) {
        console.error('Sitemap update failed.');
    }

    // Step 6: Review & Publish
    stepHeader(6, 'Review & Publish');

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

    // Summary
    console.log('\n' + '╔════════════════════════════════════════════════════════════╗');
    console.log('║                    Workflow Complete                        ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    console.log(`
Summary:
  - Health check: ${skipHealthCheck || skipFetch ? 'Skipped' : 'Yes'}
  - News fetched: ${skipFetch ? 'Skipped' : 'Yes'}
  - Prompts generated: ${skipPrompts ? 'Skipped' : 'Yes'}
  - HTML built: ${buildResult?.success ? 'Yes (with OG images & internal links)' : 'Check errors'}
  - Sitemap updated: ${sitemapResult?.success ? 'Yes' : 'Check errors'}

Output locations:
  - Health report: output/health-report.json
  - News data: output/news/
  - AI prompts: output/prompts/
  - Article drafts: output/drafts/
  - Final articles: output/articles/
  - OG images: blog/images/og/
  - Published HTML: blog/
`);
}

// Show help
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
  0. RSS Source Health Check - Validates all RSS feeds
  1. Fetch News - Retrieves articles from healthy sources
  2. Generate Prompts - Creates AI prompts from news
  3. AI Article Generation - Generates articles using Claude
  4. Build HTML - Creates HTML with OG images & internal links
  5. Update Sitemap - Updates sitemap.xml and blog index
  6. Review & Publish - Optional manual review and publish

Examples:
  node daily-workflow.js              # Full workflow, 5 articles
  node daily-workflow.js 3            # Generate 3 articles
  node daily-workflow.js --skip-fetch # Skip news fetch, use existing data
  node daily-workflow.js --skip-health # Skip health check
  node daily-workflow.js --auto       # Non-interactive mode

Individual Scripts:
  node scripts/source-health-check.js  # Run health check only
  node scripts/og-image-generator.js --test "Title"  # Test OG image
`);
    process.exit(0);
}

// Run
main().catch(err => {
    console.error('Workflow error:', err.message);
    process.exit(1);
});
