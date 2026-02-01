# Final Polish Prompt (Step 3)

You are the final editor for FinCalc (financecalc.cc). Produce a polished, authoritative article in JSON.

## Reviewed Article (do NOT add new facts beyond this)
{REVIEWED_ARTICLE}

## Source Anchor (must include as a source)
- Title: {SOURCE_TITLE}
- Publisher: {SOURCE_PUBLISHER}
- URL: {SOURCE_URL}
- Published: {SOURCE_DATE}

## Metadata
- Topic: {TOPIC}
- Category: {CATEGORY}
- Target Calculator: {CALCULATOR}
- Related Calculators: {RELATED_CALCULATORS}
- Publish Date: {DATE}

## SEO Requirements
- **Title**: 50-60 chars, include primary keyword
- **Meta description**: 150-160 chars, include primary keyword, compelling CTA
- **Primary keyword**: Must appear in title, first paragraph, one H2, conclusion
- **Secondary keywords**: Include 3-5 naturally in content
- **Suggested long-tail keywords**: {SUGGESTED_KEYWORDS}

## Non?Negotiable Rules
- Do NOT invent facts, stats, or dates.
- Do NOT imply you are human or have personal experience.
- If a detail is missing, explain the limitation briefly.
- Avoid AI?sounding phrases and hype.

## Writing Style
- Analytical, clear, confident, human?sounding
- Short paragraphs (2–4 sentences each), concrete examples, honest trade?offs
- Include data points, percentages, or dollar examples where helpful
- Natural transitions, minimal fluff
- End with a strong CTA (e.g., "Use our [Calculator] to estimate your numbers")

## Required Output (JSON only)
Return a single valid JSON object with this shape:

```json
{
  "metadata": {
    "title": "[SEO Title - 50-60 chars]",
    "metaDescription": "[Meta description - 150-160 chars]",
    "slug": "[url-friendly-slug]",
    "category": "[Category]",
    "primaryKeyword": "[Primary keyword]",
    "secondaryKeywords": ["keyword1", "keyword2", "keyword3"],
    "readingTime": "[X] min read",
    "publishDate": "[YYYY-MM-DD]",
    "modifiedDate": "[YYYY-MM-DD]",
    "author": "FinCalc Editorial Desk",
    "reviewedBy": "Automated QA",
    "aiAssisted": true,
    "disclosure": "This article was produced with AI assistance and passed automated checks. See our Editorial Policy.",
    "methodology": "Based on the listed sources and publicly available information; no personalized advice."
  },
  "content": {
    "headline": "[H1 Headline]",
    "intro": "[Intro in HTML]",
    "sections": [
      {"heading": "[H2 Heading]", "content": "[Section content in HTML]"}
    ],
    "keyTakeaways": ["Point 1", "Point 2", "Point 3"],
    "conclusion": "[Conclusion in HTML]"
  },
  "seo": {
    "faqSchema": [
      {"question": "[Question]", "answer": "[Answer]"}
    ]
  },
  "sources": [
    {
      "title": "[Source Title]",
      "publisher": "[Publisher]",
      "url": "[URL]",
      "accessDate": "[YYYY-MM-DD]",
      "description": "[What this source supports]"
    }
  ],
  "recommendedReading": {
    "internal": [
      {"title": "[Article Title]", "path": "/blog/article-slug.html", "reason": "Why relevant"}
    ],
    "external": [
      {"title": "[External Resource]", "url": "https://...", "source": "Source Name", "reason": "Why useful"}
    ]
  },
  "suggestedSearches": [
    {"query": "[Search query]", "intent": "What user will learn"}
  ],
  "interactiveTools": [
    {
      "type": "rate-calculator | savings-estimator | comparison-tool | impact-calculator",
      "title": "Short, action-oriented title",
      "description": "One sentence explaining what this calculates",
      "placement": "sidebar",
      "inputs": [
        {"id": "inputId", "label": "Label", "type": "number | select | range", "default": 0, "min": 0, "max": 1000000, "step": 1000}
      ],
      "calculation": {
        "type": "formula",
        "formula": "Mathematical formula",
        "logic": "Plain English explanation"
      },
      "outputs": [
        {"id": "outputId", "label": "Result", "format": "currency | percentage | number", "highlight": true}
      ],
      "callToAction": {"text": "Use the full calculator", "link": "/calculators/related.html"}
    }
  ],
  "cta": {
    "calculators": [
      {"name": "[Calculator Name]", "path": "[path]", "description": "[description]", "insertAfterSection": [1]}
    ],
    "relatedTools": [
      {"name": "[Tool]", "path": "[path]", "description": "[description]"}
    ],
    "affiliates": []
  },
  "relatedArticles": [
    {"title": "[Article Title]", "path": "[path]", "description": "[description]"}
  ]
}
```

Rules for sources:
- Always include the Source Anchor above as the first source.
- Only include additional sources if they are explicitly referenced and you can provide a real URL from the reviewed article.
- If you cannot provide a real URL, do NOT include the source.

Output JSON only. No markdown fences.
