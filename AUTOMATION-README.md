# FinCalc Content Automation System

Automated financial news aggregation and article generation system for financecalc.cc.

## Overview

This system automates the daily creation of SEO-optimized financial articles by:
1. Fetching news from RSS feeds and NewsAPI
2. Generating prompts for AI-assisted article writing
3. Converting AI output to HTML blog posts
4. Updating sitemap and publishing to Cloudflare Pages

## Quick Start

```bash
# Run the complete daily workflow
node scripts/daily-workflow.js

# Or run individual steps:
node scripts/news-fetcher.js      # Fetch news
node scripts/prompt-generator.js   # Generate AI prompts
node scripts/html-builder.js       # Build HTML from JSON
node scripts/sitemap-updater.js    # Update sitemap
node scripts/publish.js            # Deploy changes
```

## Directory Structure

```
finance-calculators/
├── scripts/
│   ├── news-fetcher.js       # RSS/API news fetching
│   ├── prompt-generator.js   # AI prompt generation
│   ├── html-builder.js       # JSON to HTML conversion
│   ├── affiliate-matcher.js  # Calculator/affiliate matching
│   ├── sitemap-updater.js    # Sitemap & index updates
│   ├── publish.js            # Git commit & push
│   └── daily-workflow.js     # Orchestrator script
├── config/
│   ├── news-sources.json     # RSS feed configuration
│   ├── affiliate-products.json # Calculator mappings
│   └── prompts/
│       ├── step1-draft.md    # Claude initial draft prompt
│       ├── step2-review.md   # CodeX review prompt
│       └── step3-polish.md   # Claude final polish prompt
├── templates/
│   └── blog-article.html     # Article HTML template
├── output/
│   ├── news/                 # Fetched news JSON
│   ├── prompts/              # Generated prompts
│   ├── drafts/               # AI draft outputs
│   └── articles/             # Final article JSON
└── blog/                     # Published HTML articles
```

## Daily Workflow

### Automated Steps

1. **News Fetching** (`news-fetcher.js`)
   - Fetches from 9+ RSS feeds
   - Scores articles by relevance
   - Deduplicates and categorizes
   - Outputs: `output/news/news-YYYY-MM-DD.json`

2. **Prompt Generation** (`prompt-generator.js`)
   - Selects top articles by topic diversity
   - Generates AI prompts with context
   - Outputs: `output/prompts/YYYY-MM-DD/`

3. **HTML Building** (`html-builder.js`)
   - Converts JSON articles to HTML
   - Applies blog template
   - Generates FAQ schema
   - Outputs: `blog/*.html`

4. **Sitemap Update** (`sitemap-updater.js`)
   - Adds new articles to sitemap.xml
   - Updates blog index page

5. **Publishing** (`publish.js`)
   - Git commit with auto-generated message
   - Push to trigger Cloudflare Pages deploy

### Manual Step: AI Article Generation

The 3-stage AI workflow:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Claude CLI │────▶│  CodeX CLI  │────▶│  Claude CLI │
│  (Draft)    │     │  (Review)   │     │  (Polish)   │
└─────────────┘     └─────────────┘     └─────────────┘
```

For each article:

```bash
# Step 1: Generate draft with Claude
cat output/prompts/YYYY-MM-DD/step1-draft-article-name.md | claude
# Save output to output/drafts/draft-article-name.md

# Step 2: Review with CodeX
cat output/prompts/YYYY-MM-DD/step2-review.md | codex
# With the draft content

# Step 3: Final polish with Claude
cat output/prompts/YYYY-MM-DD/step3-polish.md | claude
# Save final JSON to output/articles/final-article-name.json
```

## Configuration

### news-sources.json

```json
{
  "rssFeeds": [
    {
      "name": "Yahoo Finance",
      "url": "https://finance.yahoo.com/news/rssindex",
      "enabled": true
    }
  ],
  "newsApiKey": "YOUR_API_KEY",
  "keywords": ["mortgage", "investing", "retirement"]
}
```

### affiliate-products.json

Maps article topics to relevant calculators:

```json
{
  "topicMapping": {
    "mortgage": {
      "calculators": [
        {
          "name": "Mortgage Calculator",
          "path": "/calculators/mortgage.html"
        }
      ]
    }
  }
}
```

## Article JSON Format

The AI should output JSON in this format:

```json
{
  "metadata": {
    "title": "Article Title",
    "metaDescription": "SEO description",
    "slug": "article-slug",
    "category": "Retirement",
    "publishDate": "2026-01-20"
  },
  "content": {
    "headline": "H1 Headline",
    "intro": "<p>Introduction...</p>",
    "sections": [
      {
        "heading": "Section Title",
        "content": "<p>Content...</p>"
      }
    ],
    "keyTakeaways": ["Point 1", "Point 2"],
    "conclusion": "<p>Conclusion...</p>"
  },
  "seo": {
    "faqSchema": [
      {
        "question": "FAQ Question?",
        "answer": "FAQ Answer."
      }
    ]
  }
}
```

## Commands

```bash
# Full workflow (interactive)
node scripts/daily-workflow.js

# Full workflow with 3 articles
node scripts/daily-workflow.js 3

# Skip news fetch (use existing data)
node scripts/daily-workflow.js --skip-fetch

# Non-interactive mode
node scripts/daily-workflow.js --auto

# Analyze text for topic matching
node scripts/affiliate-matcher.js --analyze "mortgage refinancing rates"

# Dry run publish
node scripts/publish.js --dry-run
```

## Output Examples

### News JSON
```json
{
  "fetchedAt": "2026-01-20T08:00:00Z",
  "articles": [
    {
      "title": "Fed Signals Rate Cut",
      "topic": "economy",
      "score": 45
    }
  ]
}
```

### Generated Prompt
```markdown
# Claude Article Draft Generation Prompt

## News Summary
**Title**: Fed Signals Rate Cut
**Topic**: economy

## Article Requirements
...
```

## Troubleshooting

**News fetch fails:**
- Check internet connection
- Verify RSS feed URLs are accessible
- Some feeds may be geo-restricted

**HTML build shows no articles:**
- Ensure JSON files exist in output/articles/
- JSON must have `final-` prefix
- Verify JSON format matches expected schema

**Sitemap not updating:**
- Check file permissions
- Ensure blog/*.html files exist

## Cost

| Component | Cost |
|-----------|------|
| RSS Feeds | Free |
| NewsAPI (100/day) | Free |
| Claude CLI | Free (subscription) |
| Cloudflare Pages | Free |
| **Total** | **$0/month** |

## Daily Schedule

Recommended workflow timing:

```
08:00  Run news-fetcher.js
08:05  Run prompt-generator.js
08:10  AI article generation (manual)
       - 3-5 articles
       - ~30 min per article with review
10:00  Run html-builder.js
10:05  Run sitemap-updater.js
10:10  Review 1-2 articles (quality check)
10:30  Run publish.js
```

## Support

For issues with this automation system, check:
1. Node.js version (requires 16+)
2. Internet connectivity
3. File permissions
4. Git configuration
