# 🚀 Deployment Checklist

Use this checklist to deploy StartupSwipe to production.

## Pre-Deployment Setup

### 1. Create Accounts (if not done already)
- [ ] Vercel account (https://vercel.com)
- [ ] Clerk account (https://clerk.com)
- [ ] Anthropic account (https://console.anthropic.com)
- [ ] Stripe account (https://stripe.com) - for payments
- [ ] Cloudinary account (https://cloudinary.com) - for video hosting

### 2. Get API Keys
- [ ] Anthropic API key from console.anthropic.com
- [ ] Clerk publishable key + secret key
- [ ] Stripe secret key + publishable key (optional)
- [ ] Cloudinary credentials (optional)

### 3. Set Up Database

#### Option A: Vercel Postgres
```bash
vercel postgres create startup-swipe-db
vercel postgres connect startup-swipe-db
\i lib/schema.sql
\q
```

#### Option B: Supabase
```bash
# Create project at supabase.com
# Go to Settings → Database
# Copy connection string
psql "postgresql://..." < lib/schema.sql
```

---

## Deployment Steps

### 1. Install Vercel CLI
```bash
npm i -g vercel
vercel login
```

### 2. Link Project
```bash
vercel link
```

### 3. Add Environment Variables

**Required:**
```bash
vercel env add POSTGRES_URL
vercel env add POSTGRES_URL_NON_POOLING
vercel env add ANTHROPIC_API_KEY
vercel env add CLERK_SECRET_KEY
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
```

**Redirects (Required):**
```bash
vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL
# Value: /sign-in

vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL
# Value: /sign-up

vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
# Value: /onboarding

vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
# Value: /onboarding
```

**Optional (for full features):**
```bash
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_PUBLISHABLE_KEY
vercel env add CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET
```

### 4. Deploy to Production
```bash
vercel --prod
```

**Your app will be live at:** `https://your-project.vercel.app`

---

## Post-Deployment Configuration

### 1. Update Clerk Settings

Go to Clerk Dashboard → your app:

**Redirect URLs:**
- Sign-in URL: `https://your-project.vercel.app/sign-in`
- Sign-up URL: `https://your-project.vercel.app/sign-up`
- After sign-in: `https://your-project.vercel.app/onboarding`
- After sign-up: `https://your-project.vercel.app/onboarding`

**Allowed Redirect URLs:**
- Add: `https://your-project.vercel.app/*`

### 2. Set Up Domain (Optional)

In Vercel Dashboard:
1. Go to Settings → Domains
2. Add custom domain: `yourapp.com`
3. Configure DNS records (Vercel provides instructions)
4. Update Clerk redirect URLs to use custom domain

### 3. Enable Production Optimizations

**Vercel Settings:**
- [ ] Enable automatic HTTPS
- [ ] Configure caching headers
- [ ] Set up error monitoring (Sentry integration)
- [ ] Enable analytics

**Database:**
- [ ] Set connection pooling (Vercel Postgres does this automatically)
- [ ] Configure backup schedule (Supabase: automatic)
- [ ] Review query performance

### 4. Configure Stripe (If Using)

**Stripe Dashboard:**
1. Switch to Live mode
2. Get live API keys
3. Add to Vercel environment variables
4. Set webhook endpoint: `https://yourapp.com/api/webhooks/stripe`
5. Enable events: `payment_intent.succeeded`, `payment_intent.failed`

### 5. Configure Cloudinary (If Using)

**Cloudinary Dashboard:**
1. Note cloud name, API key, secret
2. Add to Vercel environment variables
3. Set upload presets for video
4. Configure auto-transcoding (MP4, adaptive streaming)

---

## Testing Production Deployment

### Smoke Tests

- [ ] Landing page loads (`/`)
- [ ] Sign-up flow works (`/sign-up`)
- [ ] Sign-in flow works (`/sign-in`)
- [ ] Onboarding completes (`/onboarding`)

### Investor Flow
- [ ] Discover page loads (`/discover`)
- [ ] Products appear in feed
- [ ] Swipe gestures work (touch + keyboard)
- [ ] AI match scores display
- [ ] Swipe right creates interaction
- [ ] Matches page shows connections (`/matches`)

### Founder Flow
- [ ] Dashboard loads (`/dashboard/founder`)
- [ ] Product creation works
- [ ] Products display in dashboard
- [ ] Analytics show (views, likes, matches)
- [ ] Synthetic testing page loads (`/products/[id]/test`)
- [ ] AI test runs successfully (check Anthropic usage)

### AI Features
- [ ] Match scores appear on products
- [ ] Purchase intent calculated on swipe
- [ ] Synthetic testing completes in 1-2 minutes
- [ ] Test results display correctly
- [ ] Due diligence insights generate

---

## Monitoring & Maintenance

### Set Up Monitoring

**Vercel Dashboard:**
- [ ] Monitor function invocations
- [ ] Check bandwidth usage
- [ ] Review error logs
- [ ] Set up alerts for downtime

**Anthropic Console:**
- [ ] Monitor API usage
- [ ] Track costs per endpoint
- [ ] Set spending limits
- [ ] Review error rates

**Database:**
- [ ] Monitor connection pool usage
- [ ] Check query performance
- [ ] Review slow queries
- [ ] Set up backup alerts

### Cost Monitoring

**Expected Monthly Costs (100-1000 users):**
- Vercel: $0-50
- Vercel Postgres: $20-100
- Anthropic API: $50-500
- Clerk: $0 (up to 10K MAU)
- **Total: $70-650/month**

**Cost Optimization:**
- [ ] Enable aggressive caching (already implemented)
- [ ] Monitor Anthropic API usage by endpoint
- [ ] Optimize database queries
- [ ] Use CDN for static assets

---

## Security Checklist

- [ ] All environment variables set
- [ ] `.env.local` not committed to git
- [ ] Clerk middleware protecting routes
- [ ] Database uses parameterized queries
- [ ] API routes check user authorization
- [ ] Rate limiting implemented (TODO)
- [ ] CORS configured for production
- [ ] HTTPS enforced (Vercel automatic)

---

## Launch Prep

### Before Public Launch

- [ ] Seed database with 10-20 sample products
- [ ] Create test investor + founder accounts
- [ ] Write launch announcement
- [ ] Set up support email
- [ ] Create privacy policy + terms of service
- [ ] Set up analytics (Posthog, Mixpanel, etc.)
- [ ] Prepare demo video
- [ ] Update README with production URL

### Launch Channels

- [ ] Product Hunt
- [ ] Hacker News (Show HN)
- [ ] Reddit (r/startups, r/entrepreneur)
- [ ] Twitter/X announcement
- [ ] LinkedIn post
- [ ] Indie Hackers
- [ ] Email to beta waitlist

---

## Rollback Plan

If something goes wrong:

```bash
# Rollback to previous deployment
vercel rollback

# Check logs
vercel logs

# Re-deploy specific commit
vercel --prod --force
```

---

## Support & Documentation

**User Support:**
- Create support email: support@yourapp.com
- Set up help center (Intercom, Help Scout, etc.)
- Add FAQ section to website
- Create video tutorials

**Developer Documentation:**
- Keep README.md updated
- Document any custom configurations
- Maintain CHANGELOG.md for updates
- Create API documentation (if exposing API)

---

## Post-Launch Tasks

### Week 1
- [ ] Monitor error logs daily
- [ ] Track user signups
- [ ] Collect user feedback
- [ ] Fix critical bugs
- [ ] Optimize slow queries

### Week 2-4
- [ ] Analyze usage patterns
- [ ] Implement user feedback
- [ ] A/B test key features
- [ ] Optimize AI costs
- [ ] Improve onboarding flow

### Month 2+
- [ ] Build new features from roadmap
- [ ] Scale infrastructure as needed
- [ ] Implement advanced analytics
- [ ] Expand to new markets
- [ ] Consider mobile app

---

## Emergency Contacts

**Critical Issues:**
- Vercel Support: https://vercel.com/support
- Clerk Support: support@clerk.com
- Anthropic Support: support@anthropic.com
- Stripe Support: https://support.stripe.com

**Team:**
- Developer: [Your email]
- Product: [Your email]
- Support: [Your email]

---

## ✅ Final Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] Sample data added
- [ ] All smoke tests pass
- [ ] Error monitoring set up
- [ ] Custom domain configured (if applicable)
- [ ] Support channels ready
- [ ] Launch announcement prepared
- [ ] Backup plan tested
- [ ] Team notified

---

**🎉 Ready to launch!**

Run: `vercel --prod`

Then share your live URL! 🚀
