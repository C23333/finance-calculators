#!/usr/bin/env node
/**
 * RSS Source Health Check Module
 * Validates RSS feed sources and generates health reports
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG_PATH = path.join(__dirname, '..', 'config', 'news-sources.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'output');
const HEALTH_REPORT_PATH = path.join(OUTPUT_DIR, 'health-report.json');

// Timeout for health checks (ms)
const CHECK_TIMEOUT = 10000;

/**
 * Load news sources configuration
 */
function loadConfig() {
    try {
        const configData = fs.readFileSync(CONFIG_PATH, 'utf8');
        return JSON.parse(configData);
    } catch (err) {
        console.error('Failed to load config:', err.message);
        return { rssFeeds: [] };
    }
}

/**
 * Save updated configuration
 */
function saveConfig(config) {
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 4));
        return true;
    } catch (err) {
        console.error('Failed to save config:', err.message);
        return false;
    }
}

/**
 * Check if a single RSS feed is healthy
 */
function checkFeedHealth(feed) {
    return new Promise((resolve) => {
        const startTime = Date.now();

        try {
            const parsedUrl = new URL(feed.url);
            const protocol = parsedUrl.protocol === 'https:' ? https : http;

            const reqOptions = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
                path: parsedUrl.pathname + parsedUrl.search,
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/rss+xml, application/xml, text/xml, */*'
                },
                timeout: CHECK_TIMEOUT
            };

            const req = protocol.request(reqOptions, (res) => {
                const responseTime = Date.now() - startTime;
                let data = '';

                res.setEncoding('utf8');
                res.on('data', chunk => {
                    data += chunk;
                    // Only read first 5KB for validation
                    if (data.length > 5000) {
                        req.destroy();
                    }
                });

                res.on('end', () => {
                    const result = validateResponse(feed, res.statusCode, data, responseTime);
                    resolve(result);
                });
            });

            req.on('error', (err) => {
                resolve({
                    name: feed.name,
                    url: feed.url,
                    healthy: false,
                    status: 'error',
                    statusCode: null,
                    responseTime: Date.now() - startTime,
                    error: err.message,
                    checkedAt: new Date().toISOString()
                });
            });

            req.on('timeout', () => {
                req.destroy();
                resolve({
                    name: feed.name,
                    url: feed.url,
                    healthy: false,
                    status: 'timeout',
                    statusCode: null,
                    responseTime: CHECK_TIMEOUT,
                    error: 'Request timeout',
                    checkedAt: new Date().toISOString()
                });
            });

            req.end();
        } catch (err) {
            resolve({
                name: feed.name,
                url: feed.url,
                healthy: false,
                status: 'invalid_url',
                statusCode: null,
                responseTime: 0,
                error: err.message,
                checkedAt: new Date().toISOString()
            });
        }
    });
}

/**
 * Validate HTTP response for RSS content
 */
function validateResponse(feed, statusCode, data, responseTime) {
    const result = {
        name: feed.name,
        url: feed.url,
        healthy: false,
        status: 'unknown',
        statusCode,
        responseTime,
        articleCount: 0,
        checkedAt: new Date().toISOString()
    };

    // Check HTTP status
    if (statusCode !== 200) {
        result.status = `http_${statusCode}`;
        result.error = `HTTP status ${statusCode}`;
        return result;
    }

    // Validate content is RSS/XML
    const isXml = data.includes('<?xml') || data.includes('<rss') || data.includes('<feed');
    if (!isXml) {
        result.status = 'invalid_content';
        result.error = 'Response is not valid RSS/XML';
        return result;
    }

    // Count items in feed
    const itemMatches = data.match(/<item[^>]*>/gi) || [];
    const entryMatches = data.match(/<entry[^>]*>/gi) || [];
    result.articleCount = itemMatches.length + entryMatches.length;

    // Check if feed has any content
    if (result.articleCount === 0) {
        result.status = 'empty_feed';
        result.error = 'Feed contains no articles';
        return result;
    }

    // All checks passed
    result.healthy = true;
    result.status = 'healthy';
    return result;
}

/**
 * Run health checks on all enabled feeds
 */
async function runHealthChecks(config, options = {}) {
    const { verbose = true, updateConfig = true } = options;
    const feeds = config.rssFeeds.filter(f => f.enabled !== false);

    if (verbose) {
        console.log('='.repeat(60));
        console.log('RSS Source Health Check');
        console.log('='.repeat(60));
        console.log(`Checking ${feeds.length} enabled feeds...\n`);
    }

    const results = [];
    const healthyFeeds = [];
    const unhealthyFeeds = [];

    for (const feed of feeds) {
        if (verbose) {
            process.stdout.write(`  Checking ${feed.name}... `);
        }

        const result = await checkFeedHealth(feed);
        results.push(result);

        if (result.healthy) {
            healthyFeeds.push(feed.name);
            if (verbose) {
                console.log(`✓ OK (${result.articleCount} articles, ${result.responseTime}ms)`);
            }
        } else {
            unhealthyFeeds.push(feed.name);
            if (verbose) {
                console.log(`✗ FAILED - ${result.error}`);
            }
        }
    }

    // Generate report
    const report = {
        generatedAt: new Date().toISOString(),
        totalFeeds: feeds.length,
        healthyCount: healthyFeeds.length,
        unhealthyCount: unhealthyFeeds.length,
        healthPercentage: Math.round((healthyFeeds.length / feeds.length) * 100),
        healthyFeeds,
        unhealthyFeeds,
        details: results
    };

    // Update config with health status if requested
    if (updateConfig) {
        config.rssFeeds = config.rssFeeds.map(feed => {
            const check = results.find(r => r.url === feed.url);
            if (check) {
                return {
                    ...feed,
                    lastHealthCheck: check.checkedAt,
                    lastHealthStatus: check.status,
                    lastArticleCount: check.articleCount
                };
            }
            return feed;
        });
        saveConfig(config);
    }

    // Save health report
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    fs.writeFileSync(HEALTH_REPORT_PATH, JSON.stringify(report, null, 2));

    if (verbose) {
        console.log('\n' + '='.repeat(60));
        console.log('Summary');
        console.log('='.repeat(60));
        console.log(`  Healthy:   ${healthyFeeds.length}/${feeds.length} (${report.healthPercentage}%)`);
        console.log(`  Unhealthy: ${unhealthyFeeds.length}/${feeds.length}`);

        if (unhealthyFeeds.length > 0) {
            console.log('\n  Unhealthy feeds:');
            unhealthyFeeds.forEach(name => console.log(`    - ${name}`));
        }

        console.log(`\n  Report saved to: ${HEALTH_REPORT_PATH}`);
    }

    return report;
}

/**
 * Get list of healthy feed URLs for use in news-fetcher
 */
function getHealthyFeeds(config) {
    const report = loadHealthReport();

    if (!report) {
        // No health report, return all enabled feeds
        return config.rssFeeds.filter(f => f.enabled !== false);
    }

    // Filter to only healthy feeds
    return config.rssFeeds.filter(feed => {
        if (feed.enabled === false) return false;
        const check = report.details?.find(r => r.url === feed.url);
        return !check || check.healthy;
    });
}

/**
 * Load existing health report
 */
function loadHealthReport() {
    try {
        if (fs.existsSync(HEALTH_REPORT_PATH)) {
            return JSON.parse(fs.readFileSync(HEALTH_REPORT_PATH, 'utf8'));
        }
    } catch (err) {
        // Ignore
    }
    return null;
}

/**
 * Check if health report is stale (older than specified hours)
 */
function isReportStale(maxAgeHours = 24) {
    const report = loadHealthReport();
    if (!report || !report.generatedAt) return true;

    const reportAge = Date.now() - new Date(report.generatedAt).getTime();
    const maxAge = maxAgeHours * 60 * 60 * 1000;
    return reportAge > maxAge;
}

/**
 * Main function
 */
async function main() {
    const config = loadConfig();
    const args = process.argv.slice(2);

    const options = {
        verbose: !args.includes('--quiet'),
        updateConfig: !args.includes('--no-update')
    };

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
RSS Source Health Check

Usage: node source-health-check.js [options]

Options:
  --quiet       Suppress output
  --no-update   Don't update config with health status
  --help, -h    Show this help message

Output:
  Health report is saved to: output/health-report.json
`);
        process.exit(0);
    }

    const report = await runHealthChecks(config, options);

    // Exit with error code if too many feeds are unhealthy
    if (report.healthPercentage < 50) {
        console.error('\nWarning: Less than 50% of feeds are healthy!');
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(err => {
        console.error('Health check error:', err.message);
        process.exit(1);
    });
}

module.exports = {
    runHealthChecks,
    checkFeedHealth,
    getHealthyFeeds,
    loadHealthReport,
    isReportStale,
    loadConfig
};
