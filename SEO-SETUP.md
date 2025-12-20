# Inkora SEO Setup Guide

## ✅ What's Been Added

### 1. **robots.txt** (public/robots.txt + src/app/robots.ts)
- Allows search engines to crawl all public pages
- Blocks private pages (profile, bookmarks, history)
- Points to sitemap location

### 2. **sitemap.xml** (src/app/sitemap.ts)
- Dynamic sitemap with all public pages
- Includes all genre pages
- Priority set for important pages

### 3. **Enhanced Metadata** (src/app/layout.tsx)
- Updated metadataBase to https://inkora.spacely.tech
- Added keywords for search engines
- Improved Open Graph tags
- Added Twitter card metadata
- Added robots configuration
- Added canonical URL

### 4. **JSON-LD Structured Data** (src/components/JsonLd.tsx)
- WebSite schema with search action
- Organization schema
- ManhwaJsonLd for individual manhwa pages (ready to use)
- BreadcrumbJsonLd for navigation

### 5. **Page-Level SEO**
- Search page: metadata added
- Genres page: metadata added
- Genre detail pages: dynamic metadata
- Privacy, Terms, Disclaimer: metadata added

---

## 📝 Next Steps to Get Indexed on Google

### Step 1: Deploy Changes
Push these changes to your repository so Vercel deploys them.

### Step 2: Set Up Google Search Console
1. Go to https://search.google.com/search-console
2. Click "Add Property"
3. Select "URL prefix" and enter: `https://inkora.spacely.tech`
4. Choose verification method:
   - **Recommended**: HTML tag verification
   - Copy the meta tag content (just the code after `content=`)
   
5. Add the verification code to `src/app/layout.tsx`:
   ```tsx
   verification: {
     google: 'your-verification-code-here',
   },
   ```

### Step 3: Submit Sitemap
1. In Google Search Console, go to "Sitemaps" in the left menu
2. Enter: `sitemap.xml`
3. Click "Submit"

### Step 4: Request Indexing
1. In Search Console, go to "URL Inspection"
2. Enter your homepage URL
3. Click "Request Indexing"
4. Do this for important pages:
   - https://inkora.spacely.tech
   - https://inkora.spacely.tech/search
   - https://inkora.spacely.tech/genres

### Step 5: Add to Bing Webmaster Tools (Optional but Recommended)
1. Go to https://www.bing.com/webmasters
2. Add your site
3. Submit sitemap

---

## 🔍 Verify Your Setup

After deploying, check these URLs:
- https://inkora.spacely.tech/sitemap.xml
- https://inkora.spacely.tech/robots.txt

---

## 📊 SEO Checklist

- [x] robots.txt configured
- [x] sitemap.xml generated
- [x] Metadata base URL set
- [x] Open Graph tags added
- [x] Twitter cards configured
- [x] JSON-LD structured data
- [x] Canonical URLs set
- [x] Keywords added
- [ ] Google Search Console verification (you need to do this)
- [ ] Sitemap submitted to Google
- [ ] Bing Webmaster Tools (optional)

---

## 🎯 Expected Timeline

- **Initial crawl**: 24-48 hours after submitting sitemap
- **First indexing**: 1-7 days
- **Full indexing**: 2-4 weeks
- **Search rankings**: 1-3 months

Google prioritizes sites with:
- Quality content
- Fast loading times
- Mobile-friendly design
- Regular updates
- Good user experience

Your site already has most of these! 🎉
