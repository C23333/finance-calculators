# Finance Calculators - Deployment Guide

## Quick Start

### 1. Purchase Domain
Recommended registrars (cheapest):
- **Porkbun** - Often cheapest for .com
- **Cloudflare Registrar** - At-cost pricing
- **Namecheap** - Good first-year deals

### 2. Update Domain in Files
```bash
cd finance-calculators
node update-domain.js your-domain.com
```

### 3. Deploy to Cloudflare Pages (Recommended - Free)

1. Push code to GitHub
2. Go to [Cloudflare Pages](https://pages.cloudflare.com)
3. Connect your GitHub repo
4. Settings:
   - Build command: (leave empty)
   - Output directory: `/`
5. Add custom domain in Cloudflare Pages settings

### 4. Alternative: Deploy to Vercel (Free)

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repo
4. Add custom domain in project settings

---

## SEO Setup Checklist

### Google Search Console
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your domain
3. Verify ownership (DNS or HTML file)
4. Submit sitemap: `https://your-domain.com/sitemap.xml`

### Google Analytics
1. Go to [Google Analytics](https://analytics.google.com)
2. Create new GA4 property
3. Get Measurement ID (G-XXXXXXXXXX)
4. Add to all pages (see `includes/head-analytics.html`)

### Bing Webmaster Tools
1. Go to [Bing Webmaster](https://www.bing.com/webmasters)
2. Import from Google Search Console (easiest)

---

## AdSense Setup

### Prerequisites
- Site must be live with real content
- At least 20-30 pages of quality content ✅
- Privacy Policy page (create one!)
- About page
- Contact information

### Application Process
1. Go to [Google AdSense](https://www.google.com/adsense)
2. Sign up with your Google account
3. Add your site URL
4. Add AdSense code to your site
5. Wait for review (1-14 days)

### After Approval
1. Create ad units in AdSense dashboard
2. Add ad code to pages (see `includes/ad-units.html`)
3. Recommended: Start with Auto Ads, then optimize

---

## Content Optimization Tips

### High-CPC Keywords to Target
| Calculator | Target Keywords |
|------------|-----------------|
| Mortgage | mortgage calculator, home loan calculator, mortgage payment |
| Refinance | refinance calculator, mortgage refinance, refi calculator |
| 401k | 401k calculator, retirement calculator, 401k contribution |
| Self-Employment | self employment tax, 1099 tax calculator, freelance taxes |

### Content to Add
1. **Blog posts** targeting long-tail keywords
2. **FAQ sections** on each calculator page
3. **Comparison guides** (e.g., "FHA vs Conventional Loans")
4. **State-specific pages** (e.g., "California Mortgage Calculator")

---

## Performance Checklist

- [x] Static HTML (fast loading)
- [x] Minimal JavaScript
- [x] Responsive design
- [x] No external dependencies (except Google Fonts)
- [ ] Add image optimization (WebP format)
- [ ] Add lazy loading for below-fold content
- [ ] Enable Cloudflare caching

---

## Missing Pages to Create

1. **Privacy Policy** - Required for AdSense
2. **Terms of Service** - Recommended
3. **About Us** - Builds trust
4. **Contact** - Required for AdSense

---

## Monthly Maintenance

1. Check Google Search Console for errors
2. Monitor Analytics for traffic trends
3. Update tax rates/limits annually (January)
4. Add new calculators based on search trends
5. Optimize underperforming pages

---

## Estimated Timeline

| Phase | Duration | Goal |
|-------|----------|------|
| Launch | Week 1 | Deploy site, submit to Google |
| Indexing | Weeks 2-4 | Get pages indexed |
| Initial Traffic | Months 2-3 | 1,000-5,000 UV/month |
| AdSense Approval | Month 2-3 | Apply after traffic |
| Growth | Months 4-12 | 10,000-50,000 UV/month |
| Maturity | Year 2+ | 100,000+ UV/month |

Good luck! 🚀
