# Cloudflare Pages Deployment Guide

Your app is now configured to work on **both** Vercel and Cloudflare Pages!

## Quick Deploy to Cloudflare Pages

### Option 1: Connect Git Repository (Recommended)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) > **Pages** > **Create a project**
2. Click **Connect to Git**
3. Select your repository
4. Configure build settings:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build:cloudflare`
   - **Build output directory**: `.vercel/output/static`
5. Add Environment Variables:
   ```
   CF_PAGES = 1
   NEXT_PUBLIC_API_URL = https://web-production-2840b.up.railway.app
   NEXT_PUBLIC_SUPABASE_URL = https://rekqzsbvvralruplvpve.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [your-key]
   NODE_VERSION = 20
   ```
6. Click **Save and Deploy**

### Option 2: Manual Deploy (CLI)

```bash
# Install dependencies
npm install

# Build for Cloudflare
npm run build:cloudflare

# Deploy (first time - will prompt for login)
npm run deploy:cloudflare
```

## Setup Custom Domain

1. In Cloudflare Pages project > **Custom domains**
2. Add `inkora.spacely.tech` (or your domain)
3. Cloudflare will auto-configure DNS if domain is on Cloudflare

## Enable Cloudflare Security Features

1. **DNS Proxy (Orange Cloud)**: Enable on your domain's DNS record
2. **SSL**: Set to "Full (strict)" in SSL/TLS settings
3. **Bot Fight Mode**: Enable in Security > Bots
4. **DDoS**: Automatic on all Cloudflare plans
5. **Web Analytics**: Enable in your Pages project settings

## Switching Between Vercel and Cloudflare

Your app automatically detects the platform:

| Platform | Detection | Image Handling |
|----------|-----------|----------------|
| Vercel | `VERCEL=1` auto-set | Next.js optimization |
| Cloudflare | `CF_PAGES=1` you set | Unoptimized (faster, no limits) |

## Keeping Both Deployments

- **Vercel**: Continues auto-deploying from `main` branch
- **Cloudflare**: Also auto-deploys from `main` branch
- Use Cloudflare as primary, Vercel as backup

## Rollback

If Cloudflare has issues:
1. Just point your domain back to Vercel
2. In Cloudflare DNS, change CNAME to `cname.vercel-dns.com`

## Costs

| Service | Free Tier |
|---------|-----------|
| Cloudflare Pages | 500 builds/month, unlimited bandwidth |
| Cloudflare CDN | Unlimited |
| Web Analytics | 500K events/month |
| Workers (if needed) | 100K requests/day |

**Total: $0** 🎉
