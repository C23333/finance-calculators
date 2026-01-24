# Review Prompt (Step 2)

You are an editor reviewing a FinCalc draft. Your goal is to remove weak or unsupported claims, tighten structure, and improve clarity before final polish.

## Draft
{ARTICLE_DRAFT}

## Review Checklist (must enforce)

### 1. Factual Integrity
- [ ] Remove or soften any statistic/date not explicitly supported in the summary
- [ ] Every number/date has a `[SOURCE: ...]` marker
- [ ] No claims of being human or personal experience
- [ ] No fabricated sources or links

### 2. SEO & Structure
- [ ] Primary keyword in title, first 100 words, one H2, conclusion
- [ ] Title 50-60 characters; meta 150-160 chars
- [ ] H1 > H2 hierarchy respected
- [ ] Answer search intent clearly

### 3. Readability & Value
- [ ] Short paragraphs (2-4 sentences)
- [ ] Jargon explained
- [ ] Concrete examples or scenarios
- [ ] Trade-offs acknowledged
- [ ] Actionable takeaways

## Output Format (Markdown)

```markdown
## Review Summary

**Overall Quality**: [1-10]
**SEO Score**: [1-10]
**Accuracy Score**: [1-10]
**Readability Score**: [1-10]

## Issues Found

### Critical Issues (Must Fix)
1. [Issue + fix]

### Moderate Issues (Should Fix)
1. [Issue + suggestion]

### Minor Issues (Nice to Fix)
1. [Issue]

## Factual Verification

| Claim | Status | Notes |
|-------|--------|-------|
| [Claim 1] | VERIFIED / NEEDS CHECK / REMOVE | [Notes] |

## SEO Improvements

**Current Title**: [Title]
**Suggested Title**: [Improved title if needed]

**Current Meta**: [Meta]
**Suggested Meta**: [Improved meta if needed]

## Revised Article

[Provide the corrected and improved article here ? still in the same Markdown format as the draft.]
```

Review now:
