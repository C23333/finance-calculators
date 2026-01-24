# FinCalc Content Automation System

Daily pipeline to fetch finance news, generate high?quality AI?assisted articles, validate quality, and publish.

## Quick Start

```bash
# Full daily workflow
node scripts/daily-workflow.js

# Individual steps
node scripts/news-fetcher.js
node scripts/article-generator.js 2026-01-24 3
node scripts/article-quality-check.js
node scripts/html-builder.js
node scripts/sitemap-updater.js
node scripts/publish.js
```

## Pipeline Steps

1. **Fetch news** (`scripts/news-fetcher.js`)
2. **Generate articles** (`scripts/article-generator.js`) using multi?stage AI (draft ? review ? polish)
3. **Quality check** (`scripts/article-quality-check.js`) for schema + sources
4. **Build HTML** (`scripts/html-builder.js`)
5. **Update sitemap** (`scripts/sitemap-updater.js`)
6. **Publish** (`scripts/publish.js`)

## Config

### `config/news-sources.json`
RSS feeds, keyword filters, topic priority.

### `config/ai-pipeline.json`
Select which local CLIs to use per stage:

```json
{
  "draft": { "cliCommand": "gemini" },
  "review": { "cliCommand": "codex" },
  "polish": { "cliCommand": "claude", "extraArgs": ["--print"] }
}
```

You can add `extraArgs`, `timeout`, and `promptMode` per stage.

## Output Structure

```
output/
  news/          # fetched news JSON
  drafts/        # draft & review markdown
  articles/      # final JSON articles
  quality-report-YYYY-MM-DD.json
blog/            # published HTML
```

## Article JSON (Required Fields)

Each final article must include:

- `metadata`: title, metaDescription, slug, category, primaryKeyword, readingTime, publishDate, modifiedDate, author, aiAssisted, disclosure, methodology
- `content`: headline, intro, sections[], keyTakeaways[], conclusion
- `sources`: array with title, publisher, url, accessDate
- `seo`, `recommendedReading`, `suggestedSearches`, `interactiveTools`, `cta`, `relatedArticles`

## Quality Guardrails

- No invented facts or statistics
- Sources must be real URLs (at least one required)
- AI assistance must be disclosed in metadata

Update prompts in `config/prompts/` to tune voice and structure.
