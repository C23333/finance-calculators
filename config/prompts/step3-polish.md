# Claude Final Polish Prompt

You are finalizing a financial article for publication on FinCalc (financecalc.cc). Your job is to polish the language, add CTAs, and output the final HTML-ready content.

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

### 3. Calculator CTAs
Insert 1-2 calculator call-to-action boxes at natural break points:

```html
<div class="calculator-cta">
    <h3>Calculate Your [Topic]</h3>
    <p>[Brief description of what the calculator does]</p>
    <a href="[calculator_path]" class="cta-btn">[Calculator Name] →</a>
</div>
```

### 4. Related Tools Section
Add at the end before conclusion:

```html
<div class="related-tools">
    <h3>📊 Related Calculators</h3>
    <ul>
        <li><a href="[path1]">[Calculator 1]</a> - [brief description]</li>
        <li><a href="[path2]">[Calculator 2]</a> - [brief description]</li>
        <li><a href="[path3]">[Calculator 3]</a> - [brief description]</li>
    </ul>
</div>
```

### 5. Affiliate Recommendation (if applicable)
If the topic relates to services, add:

```html
<div class="affiliate-recommendations">
    <h3>💡 Recommended Services</h3>
    <p>[Context for the recommendation]</p>
    <p class="affiliate-disclosure">We may earn a commission from partner links. This doesn't affect our recommendations.</p>
</div>
```

### 6. FAQ Schema Candidates
Identify 3-5 questions from the article that could be FAQ schema:
- Questions should be commonly searched
- Answers should be 1-2 sentences

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
        "keyTakeaways": [
            "[Takeaway 1]",
            "[Takeaway 2]",
            "[Takeaway 3]"
        ],
        "conclusion": "[Conclusion in HTML]"
    },
    "seo": {
        "faqSchema": [
            {
                "question": "[Question 1]",
                "answer": "[Answer 1]"
            },
            {
                "question": "[Question 2]",
                "answer": "[Answer 2]"
            }
        ]
    },
    "cta": {
        "calculators": [
            {
                "name": "[Calculator Name]",
                "path": "[/calculators/xxx.html]",
                "description": "[Brief description]",
                "insertAfterSection": [1]
            }
        ],
        "relatedTools": [
            {
                "name": "[Tool Name]",
                "path": "[path]",
                "description": "[description]"
            }
        ],
        "affiliates": []
    },
    "relatedArticles": [
        {
            "title": "[Article Title]",
            "path": "[article-slug.html]",
            "description": "[Brief description]"
        }
    ]
}
```

## Quality Checklist Before Output
- [ ] Title is compelling and SEO-friendly
- [ ] All HTML is properly formatted
- [ ] No broken internal links
- [ ] CTAs feel natural, not forced
- [ ] FAQ questions are genuinely useful
- [ ] Content flows well when read aloud
- [ ] No placeholder text remaining

Now polish and finalize the article:
