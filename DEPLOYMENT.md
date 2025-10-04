# Deployment Guide

This guide will help you deploy Compel to production.

## Prerequisites

- Supabase project (production instance)
- Vercel account (recommended) or any Node.js hosting
- Domain name (optional)

## Supabase Setup

### 1. Create Production Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project
3. Wait for project initialization

### 2. Run Database Schema

1. Go to SQL Editor in your Supabase dashboard
2. Copy the contents of `database/schema.sql`
3. Run the SQL script
4. Verify tables are created

### 3. Configure Authentication

1. Go to Authentication → Settings
2. Enable Email provider
3. Configure email templates (optional)
4. Set Site URL to your production domain
5. Add Redirect URLs:
   - `https://yourdomain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for local testing)

### 4. Get API Keys

1. Go to Settings → API
2. Copy:
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - Anon/Public key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## Vercel Deployment

### 1. Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2. Deploy via GitHub (Recommended)

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/)
3. Click "Import Project"
4. Select your GitHub repository
5. Configure project:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_production_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
   ```
7. Click "Deploy"

### 3. Deploy via CLI

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### 4. Configure Domain

1. Go to your project settings in Vercel
2. Navigate to Domains
3. Add your custom domain
4. Update DNS records as instructed

## Alternative Hosting (Docker)

### Create Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Build and Run

```bash
# Build
docker build -t compel .

# Run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  compel
```

## Post-Deployment Checklist

- [ ] Database schema is deployed
- [ ] Environment variables are set
- [ ] Authentication is working
- [ ] Email provider is configured
- [ ] Test user signup/login
- [ ] Test goal creation
- [ ] Check dashboard loads correctly
- [ ] Verify dark mode works
- [ ] Test on mobile devices
- [ ] Set up monitoring (Vercel Analytics)
- [ ] Configure error tracking (Sentry, optional)

## Environment Variables Reference

### Required
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Optional (Future)
```env
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Monitoring

### Vercel Analytics

1. Go to your project in Vercel
2. Navigate to Analytics tab
3. Enable Web Analytics
4. Add to `layout.tsx`:

```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Error Tracking with Sentry (Optional)

```bash
npm install @sentry/nextjs
```

Follow Sentry setup wizard.

## Performance Optimization

### Enable Image Optimization

In `next.config.ts`:

```typescript
const config: NextConfig = {
  images: {
    domains: ['etapcequqzduxtnryvhc.supabase.co'],
  },
};
```

### Enable Compression

Vercel enables this by default, but for custom hosting:

```bash
npm install compression
```

## Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] RLS policies tested
- [ ] CORS configured properly
- [ ] Rate limiting implemented (future)
- [ ] Input validation on all forms
- [ ] SQL injection prevention (Supabase handles this)
- [ ] XSS prevention (React handles this)

## Backup Strategy

### Database Backups

1. Go to Supabase Dashboard
2. Settings → Database
3. Enable Point-in-Time Recovery (Pro plan)
4. Set up daily backups

### Manual Backup

```bash
# Use Supabase CLI
supabase db dump > backup.sql
```

## Rollback Plan

### Vercel Rollback

1. Go to Deployments in Vercel
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Database Rollback

1. Use Supabase Point-in-Time Recovery
2. Or restore from manual backup:

```bash
supabase db reset --db-url "your-db-url"
```

## Support

For issues:
- Check Vercel deployment logs
- Check Supabase logs
- Review browser console errors
- Check network tab for API errors

---

Happy Deploying! 🚀

