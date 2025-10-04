# Quick Start Guide

Get Compel up and running in 5 minutes!

## 📋 Prerequisites Checklist

- [ ] Node.js 20+ installed
- [ ] npm or yarn installed
- [ ] Supabase account created
- [ ] Git installed

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies (30 seconds)

```bash
npm install
```

### Step 2: Set Up Supabase (2 minutes)

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)
2. **Get your credentials**:
   - Go to Settings → API
   - Copy the Project URL and anon key
3. **Create `.env.local`** in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### Step 3: Set Up Database (1 minute)

1. Go to your Supabase project
2. Click on "SQL Editor"
3. Click "New Query"
4. Copy the entire contents of `database/schema.sql`
5. Paste and click "Run"
6. Wait for "Success" message

### Step 4: Start Development Server (30 seconds)

```bash
npm run dev
```

### Step 5: Test the App (1 minute)

1. Open [http://localhost:3000](http://localhost:3000)
2. Click "Get Started"
3. Create an account
4. You're in! 🎉

## 🎯 What You Can Do Now

### Create Your First Goal

1. Click "Create New Goal" on the dashboard
2. Fill in the details:
   - **Title**: e.g., "Exercise 3 times per week"
   - **Description**: More details about your goal
   - **Stake Amount**: How much you'll lose if you fail
   - **Recipient**: Where the money goes if you fail
   - **Frequency**: How often you'll check in
   - **Dates**: Start and end dates

### Explore the Dashboard

- View your stats (active goals, completed, failed)
- See how much you have at stake
- Track your progress

### Navigate the App

- **Dashboard**: Overview of all your goals
- **My Goals**: Detailed list of all goals
- **Create Goal**: Set up new commitments

## 🎨 Customize Your Experience

### Dark Mode

Click on your system's dark mode toggle - the app automatically adapts!

### Profile

Your profile is created automatically on signup. Future updates will allow customization.

## 🔧 Troubleshooting

### Can't connect to Supabase?

1. Check your `.env.local` file exists
2. Verify the credentials are correct
3. Restart the dev server: `Ctrl+C` then `npm run dev`

### Database errors?

1. Make sure you ran the `schema.sql` file
2. Check that all tables were created in Supabase
3. Verify RLS policies are enabled

### TypeScript errors?

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Port 3000 already in use?

```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill

# Or use a different port
PORT=3001 npm run dev
```

## 📱 Test on Your Phone

1. Find your computer's IP address:
   ```bash
   # macOS/Linux
   ifconfig | grep inet
   
   # Windows
   ipconfig
   ```

2. On your phone, go to:
   ```
   http://YOUR_IP_ADDRESS:3000
   ```

3. Make sure your phone and computer are on the same WiFi network

## 🚀 Next Steps

### Build Features

Check out these files to understand the structure:
- `src/app/page.tsx` - Landing page
- `src/app/dashboard/page.tsx` - Dashboard
- `src/components/goals/CreateGoalForm.tsx` - Goal creation
- `src/app/api/goals/route.ts` - API endpoints

### Add Payment Integration

You'll want to integrate Stripe for real payments:
1. Create a Stripe account
2. Get API keys
3. Add to `.env.local`:
   ```env
   STRIPE_PUBLIC_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

### Deploy to Production

When ready to deploy:
1. Read `DEPLOYMENT.md`
2. Push to GitHub
3. Deploy to Vercel
4. Set up production Supabase

## 📚 Learn More

- [README.md](README.md) - Full documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contributing guidelines

## 💡 Pro Tips

1. **Test with small stakes first** - Use $1-5 while testing
2. **Start with weekly check-ins** - Daily can be overwhelming
3. **Be specific with goals** - "Exercise 3x/week" is better than "Get fit"
4. **Use the description** - Add details about what counts as success
5. **Pick meaningful stakes** - Choose a recipient that motivates you

## 🎉 You're All Set!

Start creating goals and staying accountable! Remember:
- Set realistic goals
- Choose stakes that motivate you
- Check in regularly
- Stay committed!

Need help? Check the documentation or create an issue on GitHub.

Happy goal-achieving! 💪

