#!/usr/bin/env node
/**
 * Daily Workflow Orchestrator
 * Coordinates the entire article generation pipeline
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
    const autoMode = args.includes('--auto');
    const articleCount = parseInt(args.find(a => /^\d+$/.test(a))) || 5;

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     FinCalc Daily Content Generation Workflow              ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\nDate: ${new Date().toISOString().split('T')[0]}`);
    console.log(`Article target: ${articleCount}`);
    console.log();

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

    // Step 3: Manual AI Processing
    stepHeader(3, 'AI Article Generation (Manual Step)');
    console.log(`
This step requires manual interaction with AI CLI tools.

For each article:
  1. Open the prompt file from output/prompts/
  2. Run Claude CLI with Step 1 prompt (draft generation)
  3. Save output to output/drafts/
  4. Run CodeX CLI with Step 2 prompt (review)
  5. Run Claude CLI with Step 3 prompt (final polish)
  6. Save final JSON to output/articles/

Prompt files location:
  ${path.join(OUTPUT_DIR, 'prompts')}

After completing AI generation, press Enter to continue...
`);

    if (!autoMode) {
        await prompt('Press Enter when ready to continue...');
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
  - News fetched: ${skipFetch ? 'Skipped' : 'Yes'}
  - Prompts generated: ${skipPrompts ? 'Skipped' : 'Yes'}
  - HTML built: ${buildResult?.success ? 'Yes' : 'Check errors'}
  - Sitemap updated: ${sitemapResult?.success ? 'Yes' : 'Check errors'}

Output locations:
  - News data: output/news/
  - AI prompts: output/prompts/
  - Article drafts: output/drafts/
  - Final articles: output/articles/
  - Published HTML: blog/
`);
}

// Show help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Daily Workflow Orchestrator

Usage: node daily-workflow.js [options] [article-count]

Options:
  --skip-fetch    Skip news fetching step
  --skip-prompts  Skip prompt generation step
  --auto          Run in non-interactive mode
  --help, -h      Show this help message

Arguments:
  article-count   Number of articles to generate (default: 5)

Examples:
  node daily-workflow.js              # Full workflow, 5 articles
  node daily-workflow.js 3            # Generate 3 articles
  node daily-workflow.js --skip-fetch # Skip news fetch, use existing data
  node daily-workflow.js --auto       # Non-interactive mode
`);
    process.exit(0);
}

// Run
main().catch(err => {
    console.error('Workflow error:', err.message);
    process.exit(1);
});
