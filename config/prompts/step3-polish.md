# Claude Final Polish Prompt

You are finalizing a financial article for publication on FinCalc (financecalc.cc). Your job is to polish the language, add CTAs, generate interactive tools, and output the final HTML-ready content.

## Reviewed Article
{REVIEWED_ARTICLE}

## Article Metadata
- **Topic**: {TOPIC}
- **Category**: {CATEGORY}
- **Target Calculator**: {CALCULATOR}
- **Related Calculators**: {RELATED_CALCULATORS}
- **Publish Date**: {DATE}

## Final Polish Tasks

### 1. Language Polish
- Ensure smooth, natural flow
- Vary sentence structure
- Strengthen weak verbs
- Remove redundancy
- Check grammar and punctuation
- Ensure consistent tone throughout

### 2. Add Engagement Elements
- Add a compelling opening hook if missing
- Ensure transitions between sections
- Add rhetorical questions where appropriate
- Include reader-addressing ("you", "your")

### 3. 📚 资料来源 (Sources)
Provide credible sources for all statistics and claims:

```json
"sources": [
    {
        "title": "Source Title",
        "publisher": "Organization Name",
        "url": "https://...",
        "accessDate": "2026-01-20",
        "description": "Brief description of what this source provides"
    }
]
```

**Guidelines:**
- Include 3-5 authoritative sources
- Government sources (IRS, Fed, BLS) are preferred
- Major financial publications (WSJ, Bloomberg, Reuters)
- Never fabricate sources - only cite real, verifiable sources

### 4. 📖 推荐阅读 (Recommended Reading)
Suggest related content to keep users engaged:

```json
"recommendedReading": {
    "internal": [
        {
            "title": "Article Title",
            "path": "/blog/article-slug.html",
            "reason": "Why this is relevant"
        }
    ],
    "external": [
        {
            "title": "External Resource",
            "url": "https://...",
            "source": "Source Name",
            "reason": "Why readers should check this"
        }
    ]
}
```

### 5. 🔍 推荐搜索 (Suggested Searches)
Generate search queries users might want to explore:

```json
"suggestedSearches": [
    {
        "query": "mortgage rates 2026 predictions",
        "intent": "Learn where rates might go",
        "searchUrl": "https://www.google.com/search?q=..."
    }
]
```

Provide 3-5 search queries that:
- Expand on the article topic
- Help users research their specific situation
- Lead to more detailed information

### 6. 🧮 互动工具 (Interactive Tool) - CRITICAL!
**This is the most important engagement feature!**

Based on the article content, design an interactive tool that lets readers apply the information to their personal situation.

```json
"interactiveTools": [
    {
        "type": "rate-calculator | policy-checker | eligibility-checker | savings-estimator | comparison-tool | impact-calculator",
        "title": "Tool Title (action-oriented)",
        "description": "What this tool helps you do",
        "relevance": "Why this tool matters for this article",
        "inputs": [
            {
                "id": "inputId",
                "label": "User-friendly label",
                "type": "number | select | range | boolean",
                "placeholder": "Example value",
                "default": 0,
                "min": 0,
                "max": 1000000,
                "step": 1000,
                "options": ["Option 1", "Option 2"],
                "helpText": "Brief explanation"
            }
        ],
        "calculation": {
            "type": "formula | lookup | conditional",
            "formula": "Mathematical formula if applicable",
            "logic": "Description of calculation logic"
        },
        "outputs": [
            {
                "id": "outputId",
                "label": "Output Label",
                "format": "currency | percentage | text",
                "highlight": true
            }
        ],
        "callToAction": {
            "text": "Take Next Step",
            "link": "/calculators/related.html"
        }
    }
]
```

**Tool Type Guidelines:**

| Article Topic | Recommended Tool | Purpose |
|--------------|------------------|---------|
| Interest rate changes | rate-calculator | "See how the new rate affects YOUR payment" |
| New tax law/policy | policy-checker | "Check if this policy affects YOU" |
| Program eligibility | eligibility-checker | "Are YOU eligible for this program?" |
| Cost savings | savings-estimator | "Calculate YOUR potential savings" |
| A vs B comparison | comparison-tool | "Which option is better for YOU?" |
| Economic changes | impact-calculator | "How will this impact YOUR finances?" |

**Example: Article about Fed rate hike**
```json
{
    "type": "impact-calculator",
    "title": "How Will the Rate Hike Affect Your Mortgage?",
    "inputs": [
        {"id": "loanAmount", "label": "Your Loan Amount", "type": "number", "default": 300000},
        {"id": "currentRate", "label": "Your Current Rate (%)", "type": "number", "default": 6.5},
        {"id": "loanTerm", "label": "Loan Term", "type": "select", "options": [15, 20, 30]}
    ],
    "outputs": [
        {"id": "currentPayment", "label": "Current Monthly Payment", "format": "currency"},
        {"id": "newPayment", "label": "New Monthly Payment", "format": "currency"},
        {"id": "monthlyIncrease", "label": "Monthly Increase", "format": "currency", "highlight": true}
    ]
}
```

### 7. Calculator CTAs
Insert 1-2 calculator call-to-action boxes at natural break points.

### 8. Related Tools Section
Add at the end before conclusion with links to relevant calculators.

## Output Format

Provide the final article in this JSON structure:

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
        "modifiedDate": "[YYYY-MM-DD]"
    },
    "content": {
        "headline": "[H1 Headline]",
        "intro": "[Introduction paragraph(s) in HTML]",
        "sections": [
            {
                "heading": "[H2 Heading]",
                "content": "[Section content in HTML]"
            }
        ],
        "keyTakeaways": ["Point 1", "Point 2", "Point 3"],
        "conclusion": "[Conclusion in HTML]"
    },
    "seo": {
        "faqSchema": [
            {
                "question": "[Question]",
                "answer": "[Answer]"
            }
        ]
    },
    "sources": [
        {
            "title": "[Source Title]",
            "publisher": "[Publisher]",
            "url": "[URL]",
            "accessDate": "[Date]"
        }
    ],
    "recommendedReading": {
        "internal": [
            {
                "title": "[Article Title]",
                "path": "[path]",
                "reason": "[Why relevant]"
            }
        ],
        "external": [
            {
                "title": "[Resource Title]",
                "url": "[URL]",
                "source": "[Source]"
            }
        ]
    },
    "suggestedSearches": [
        {
            "query": "[Search query]",
            "intent": "[What user will learn]"
        }
    ],
    "interactiveTools": [
        {
            "type": "[tool-type]",
            "title": "[Tool Title]",
            "description": "[Description]",
            "inputs": [...],
            "outputs": [...],
            "calculation": {...}
        }
    ],
    "cta": {
        "calculators": [
            {
                "name": "[Calculator Name]",
                "path": "[path]",
                "description": "[description]",
                "insertAfterSection": [1]
            }
        ],
        "relatedTools": [...],
        "affiliates": []
    },
    "relatedArticles": [
        {
            "title": "[Article Title]",
            "path": "[path]",
            "description": "[description]"
        }
    ]
}
```

## Quality Checklist Before Output
- [ ] Title is compelling and SEO-friendly
- [ ] All HTML is properly formatted
- [ ] **Interactive tool is designed and relevant**
- [ ] Sources are credible and verifiable
- [ ] Recommended reading keeps users on site
- [ ] Suggested searches are helpful
- [ ] CTAs feel natural, not forced
- [ ] FAQ questions are genuinely useful
- [ ] Content flows well when read aloud

Now polish and finalize the article:
