# 🚀 Quick Start Guide

Get StartupSwipe running locally in **5 minutes**.

## Prerequisites

- Node.js 18+ installed
- A terminal/command line
- Text editor (VS Code recommended)

## Step 1: Install Dependencies (1 min)

```bash
cd startup-swipe-marketplace
npm install --legacy-peer-deps
```

## Step 2: Set Up Environment Variables (2 min)

Create `.env.local` in the project root:

```bash
# Minimum required to run locally without database:

# Anthropic API (get from https://console.anthropic.com)
ANTHROPIC_API_KEY="sk-ant-api03-YOUR_KEY_HERE"

# Clerk Auth (get from https://clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_YOUR_KEY"
CLERK_SECRET_KEY="sk_test_YOUR_KEY"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/onboarding"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/onboarding"

# Optional: Database (needed for full functionality)
# POSTGRES_URL="postgres://user:pass@host:5432/db"
```

### Get API Keys:

**Anthropic (Required):**
1. Go to https://console.anthropic.com
2. Sign up / Sign in
3. Go to API Keys → Create Key
4. Copy key to `.env.local`

**Clerk (Required):**
1. Go to https://clerk.com
2. Create free account
3. Create new application
4. Copy publishable key and secret key to `.env.local`

## Step 3: Run Development Server (30 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 4: Set Up Database (Optional but Recommended)

### Option A: Vercel Postgres (Easiest)

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Create database
vercel postgres create startup-swipe-db

# Get credentials (auto-added to .env.local)
vercel env pull

# Initialize schema
vercel postgres connect startup-swipe-db
\i lib/schema.sql
\q
```

### Option B: Supabase (Alternative)

1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database → Connection string
4. Copy URI and add to `.env.local` as `POSTGRES_URL`
5. Run schema:
   ```bash
   psql "YOUR_CONNECTION_STRING" < lib/schema.sql
   ```

## 🎉 You're Ready!

### Test the Platform:

1. **Sign Up**: Go to http://localhost:3000/sign-up
2. **Onboarding**: Choose "Founder" or "Investor"
3. **Explore**:
   - **Founders**: Create a product, run AI test
   - **Investors**: Swipe through products (demo data needed)

## Common Issues

### "Unauthorized" errors
- Check Clerk keys in `.env.local`
- Restart dev server: `npm run dev`

### Database connection fails
- Verify `POSTGRES_URL` is correct
- Check database is accessible

### AI features not working
- Verify `ANTHROPIC_API_KEY` is valid
- Check quota at console.anthropic.com

## Next Steps

1. **Read Full Documentation**: See `README.md`
2. **Add Sample Data**: Create test products as founder
3. **Customize**: Edit components in `components/` and `app/`
4. **Deploy**: See `README.md` deployment section

## Project Structure

```
app/
├── api/               # API endpoints
├── dashboard/         # Founder dashboard
├── discover/          # Investor feed
├── matches/           # Matches page
├── onboarding/        # User type selection
└── products/          # Product pages

components/
└── ProductSwiper.tsx  # Swipe interface

lib/
├── claude.ts          # AI functions
├── db.ts              # Database utils
└── schema.sql         # PostgreSQL schema
```

## Key Features to Test

- ✅ Swipe Interface (keyboard: ← → ↑)
- ✅ AI Match Scoring
- ✅ Purchase Intent Prediction
- ✅ Synthetic User Testing ($29 feature)
- ✅ Product Creation
- ✅ Matches & Connections

## Support

- **Documentation**: `README.md`
- **Issues**: Create GitHub issue
- **Questions**: Check README troubleshooting section

---

**Happy Building! 🚀**
