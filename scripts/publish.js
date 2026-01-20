#!/usr/bin/env node
/**
 * Publish Script
 * Commits changes and deploys to Cloudflare Pages via Git
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Paths
const PROJECT_ROOT = path.join(__dirname, '..');

/**
 * Execute a command and return the output
 */
function exec(command, options = {}) {
    try {
        return execSync(command, {
            cwd: PROJECT_ROOT,
            encoding: 'utf8',
            ...options
        }).trim();
    } catch (err) {
        if (options.ignoreError) {
            return '';
        }
        throw err;
    }
}

/**
 * Check if there are uncommitted changes
 */
function hasChanges() {
    const status = exec('git status --porcelain');
    return status.length > 0;
}

/**
 * Get list of changed files
 */
function getChangedFiles() {
    const status = exec('git status --porcelain');
    const files = status.split('\n').filter(Boolean).map(line => {
        const status = line.substring(0, 2).trim();
        const file = line.substring(3);
        return { status, file };
    });
    return files;
}

/**
 * Get new blog articles from changes
 */
function getNewBlogArticles(changedFiles) {
    return changedFiles.filter(f =>
        f.file.startsWith('blog/') &&
        f.file.endsWith('.html') &&
        !f.file.includes('/index.html') &&
        (f.status === '?' || f.status === 'A')
    ).map(f => f.file);
}

/**
 * Generate commit message
 */
function generateCommitMessage(changedFiles) {
    const newArticles = getNewBlogArticles(changedFiles);
    const modifiedCount = changedFiles.filter(f => f.status === 'M').length;

    if (newArticles.length > 0) {
        if (newArticles.length === 1) {
            const articleName = path.basename(newArticles[0], '.html')
                .replace(/-/g, ' ')
                .replace(/\b\w/g, c => c.toUpperCase());
            return `Add blog article: ${articleName}`;
        } else {
            return `Add ${newArticles.length} new blog articles`;
        }
    }

    if (modifiedCount > 0) {
        return `Update ${modifiedCount} file${modifiedCount > 1 ? 's' : ''}`;
    }

    return 'Content updates';
}

/**
 * Prompt user for confirmation
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
 * Stage files
 */
function stageFiles(files) {
    // Stage specific files or all changes
    if (files && files.length > 0) {
        files.forEach(file => {
            exec(`git add "${file}"`);
        });
    } else {
        exec('git add -A');
    }
}

/**
 * Create commit
 */
function commit(message) {
    // Escape double quotes in message
    const escapedMessage = message.replace(/"/g, '\\"');
    exec(`git commit -m "${escapedMessage}"`);
}

/**
 * Push to remote
 */
function push() {
    exec('git push');
}

/**
 * Get current branch
 */
function getCurrentBranch() {
    return exec('git branch --show-current');
}

/**
 * Check if remote is configured
 */
function hasRemote() {
    const remotes = exec('git remote -v', { ignoreError: true });
    return remotes.includes('origin');
}

/**
 * Main function
 */
async function main() {
    const args = process.argv.slice(2);
    const forceMode = args.includes('--force') || args.includes('-f');
    const dryRun = args.includes('--dry-run') || args.includes('-n');
    const customMessage = args.find(a => a.startsWith('--message=') || a.startsWith('-m='));

    console.log('='.repeat(60));
    console.log('Publish Script');
    console.log('='.repeat(60));
    console.log(`Started at: ${new Date().toISOString()}`);
    if (dryRun) console.log('DRY RUN MODE - No changes will be made');
    console.log();

    // Check for git
    try {
        exec('git --version');
    } catch (err) {
        console.error('Git is not installed or not in PATH');
        process.exit(1);
    }

    // Check if in git repo
    try {
        exec('git rev-parse --git-dir');
    } catch (err) {
        console.error('Not a git repository');
        process.exit(1);
    }

    // Get current branch
    const branch = getCurrentBranch();
    console.log(`Current branch: ${branch}`);

    // Check for remote
    if (!hasRemote()) {
        console.error('No remote repository configured');
        console.log('Run: git remote add origin <repository-url>');
        process.exit(1);
    }

    // Check for changes
    if (!hasChanges()) {
        console.log('\nNo changes to publish.');
        return;
    }

    // Get changed files
    const changedFiles = getChangedFiles();
    console.log(`\nChanged files (${changedFiles.length}):`);

    // Group by type
    const newFiles = changedFiles.filter(f => f.status === '?' || f.status === 'A');
    const modifiedFiles = changedFiles.filter(f => f.status === 'M');
    const deletedFiles = changedFiles.filter(f => f.status === 'D');

    if (newFiles.length > 0) {
        console.log('\n  New files:');
        newFiles.forEach(f => console.log(`    + ${f.file}`));
    }

    if (modifiedFiles.length > 0) {
        console.log('\n  Modified files:');
        modifiedFiles.forEach(f => console.log(`    M ${f.file}`));
    }

    if (deletedFiles.length > 0) {
        console.log('\n  Deleted files:');
        deletedFiles.forEach(f => console.log(`    - ${f.file}`));
    }

    // Generate commit message
    let commitMessage = customMessage
        ? customMessage.replace(/^--message=|-m=/, '')
        : generateCommitMessage(changedFiles);

    console.log(`\nCommit message: "${commitMessage}"`);

    // Confirm
    if (!forceMode && !dryRun) {
        const answer = await prompt('\nProceed with publish? (y/n): ');
        if (answer !== 'y' && answer !== 'yes') {
            console.log('Cancelled.');
            return;
        }
    }

    if (dryRun) {
        console.log('\nDRY RUN - Would execute:');
        console.log('  git add -A');
        console.log(`  git commit -m "${commitMessage}"`);
        console.log('  git push');
        return;
    }

    // Stage all changes
    console.log('\nStaging files...');
    stageFiles();
    console.log('  Done');

    // Commit
    console.log('\nCreating commit...');
    commit(commitMessage);
    console.log('  Done');

    // Push
    console.log('\nPushing to remote...');
    push();
    console.log('  Done');

    console.log('\n' + '='.repeat(60));
    console.log('Published successfully!');
    console.log('='.repeat(60));

    console.log(`
Cloudflare Pages will automatically deploy the changes.
Check deployment status at: https://dash.cloudflare.com/

New articles will be available at:
  https://financecalc.cc/blog/
`);

    // Log published articles
    const newArticles = getNewBlogArticles(changedFiles);
    if (newArticles.length > 0) {
        console.log('Published articles:');
        newArticles.forEach(article => {
            const url = `https://financecalc.cc/${article}`;
            console.log(`  - ${url}`);
        });
    }
}

// Export for use as module
module.exports = {
    main,
    hasChanges,
    getChangedFiles,
    generateCommitMessage
};

// Run if called directly
if (require.main === module) {
    main().catch(err => {
        console.error('Error:', err.message);
        process.exit(1);
    });
}
