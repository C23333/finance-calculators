# GA4 Events & Goals Setup

Configure these in Google Analytics 4 for FinCalc (G-QFTQMV9QP7).

## Key Events (Already Tracked)

| Event | Category | Purpose |
|-------|----------|---------|
| `calculator_use` | calculator | User submitted a calculator form |
| `calculate_click` | calculator | User clicked calculate button |
| `scroll_depth` | engagement | 25%, 50%, 75%, 100% article read |
| `outbound_click` | outbound | Clicks to external sites |
| `internal_link_click` | calculator_cta / article_cta | CTA clicks to calculators or related articles |
| `LCP`, `FID`, `CLS` | Web Vitals | Core Web Vitals (from performance.js) |

## Recommended GA4 Conversions

Mark these as conversions in GA4 Admin > Events > Mark as conversion:

1. **calculator_use** - Primary conversion (user engaged with tool)
2. **internal_link_click** (calculator_cta) - User clicked through to calculator
3. **scroll_depth** (100%) - User read full article

## Custom Dimensions (Optional)

- `calculator_name` - Which calculator was used
- `article_slug` - Which article generated the click

## Audiences to Create

1. **Calculator Users** - Users with calculator_use event
2. **Article Readers** - Users with scroll_depth >= 50%
3. **High Intent** - Users with internal_link_click to calculators
