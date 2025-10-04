# Getting Started with Compel

Welcome to **Compel** - your commitment app with real stakes! 🎯

## 📋 What You Have

Your Compel application is now fully set up with:

✅ **Authentication System**
- Sign up and login pages
- Secure session management
- Protected routes with middleware

✅ **Core Features**
- Beautiful landing page
- User dashboard with statistics
- Goal creation and management
- Goal listing and viewing
- API routes for CRUD operations

✅ **Professional UI Components**
- Buttons, Cards, Inputs, Selects, Textareas
- Badges for status indicators
- Responsive design with dark mode
- Modern, clean aesthetics

✅ **Database Schema**
- Complete SQL schema ready to deploy
- Row-level security (RLS) policies
- Proper relationships and constraints
- Optimized indexes

✅ **Developer Experience**
- TypeScript throughout
- Fully typed Supabase integration
- ESLint configuration
- Clean build with no errors

## 🚀 Next Steps

### 1. Set Up Supabase (5 minutes)

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database schema**:
   - Go to SQL Editor in Supabase
   - Copy contents from `database/schema.sql`
   - Paste and run

3. **Get your credentials**:
   - Settings → API
   - Copy Project URL and anon key
   - Update `.env.local` (already created for you)

### 2. Start Development (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Test the App (2 minutes)

1. Click "Get Started" on landing page
2. Create an account
3. Create your first goal
4. Explore the dashboard

## 📖 Documentation

### Quick References
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide
- **[README.md](README.md)** - Complete documentation
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Architecture overview
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - How to deploy
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Development guidelines

### Key Files to Know

#### Frontend Pages
```
src/app/page.tsx              # Landing page
src/app/dashboard/page.tsx    # Dashboard
src/app/goals/page.tsx        # Goals list
src/app/goals/new/page.tsx    # Create goal
```

#### Components
```
src/components/ui/            # Reusable UI components
src/components/goals/         # Goal-related components
src/components/auth/          # Authentication components
```

#### Backend
```
src/app/api/goals/route.ts         # Goals API
src/app/api/goals/[id]/route.ts    # Single goal API
src/app/api/check-ins/route.ts     # Check-ins API
```

## 🎯 Feature Roadmap

### ✅ Completed (Available Now)
- User authentication
- Goal creation and management
- Dashboard with statistics
- Responsive UI with dark mode
- Type-safe API routes
- Database schema with RLS

### 🔄 Next to Build
1. **Check-in Functionality**
   - Evidence upload
   - Check-in reminders
   - Missed check-in tracking

2. **Payment Integration**
   - Stripe setup
   - Stake collection
   - Automated payouts

3. **Notifications**
   - Email reminders
   - Check-in notifications
   - Goal completion alerts

4. **Social Features**
   - Accountability partners
   - Friend invitations
   - Shared goals

5. **Analytics**
   - Success rate tracking
   - Progress charts
   - Goal insights

## 💻 Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 🎨 Customization

### Add Your Branding

1. **Logo**: Replace the "Compel" text in `Navigation.tsx`
2. **Colors**: Update Tailwind colors in `globals.css`
3. **Fonts**: Change fonts in `layout.tsx`
4. **Favicon**: Replace `src/app/favicon.ico`

### Extend the Database

1. Edit `database/schema.sql`
2. Add new tables or columns
3. Update TypeScript types in `src/types/`
4. Regenerate Supabase types:
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
   ```

## 🔐 Environment Variables

Make sure `.env.local` contains:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Never commit `.env.local` to git!** ✋

## 🐛 Troubleshooting

### Build Errors?
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Database Issues?
1. Verify schema was run in Supabase
2. Check RLS policies are enabled
3. Ensure credentials in `.env.local` are correct

### TypeScript Errors?
1. Check all imports use `@/` aliases
2. Verify Supabase types match database
3. Run `npm run build` to see specific errors

## 📞 Support Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

### Community
- Next.js Discord
- Supabase Discord
- Stack Overflow

## 🎉 You're Ready!

Your app is production-ready with:
- ✅ No linter errors
- ✅ Clean TypeScript build
- ✅ All core features implemented
- ✅ Comprehensive documentation
- ✅ Professional code structure

### Start Building!

1. **Test locally**: `npm run dev`
2. **Customize**: Add your branding
3. **Extend**: Build check-in functionality
4. **Integrate**: Add payment processing
5. **Deploy**: Follow DEPLOYMENT.md

## 📝 Code Quality

The codebase follows:
- ✅ TypeScript strict mode
- ✅ ESLint best practices
- ✅ Component composition patterns
- ✅ Server/Client component separation
- ✅ Proper error handling
- ✅ Type-safe database queries

## 🚀 Deployment Checklist

When ready to deploy:
- [ ] Set up production Supabase
- [ ] Run database schema
- [ ] Configure auth settings
- [ ] Deploy to Vercel
- [ ] Set environment variables
- [ ] Test authentication
- [ ] Test goal creation
- [ ] Configure custom domain

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

---

**Happy coding!** 💪 Build something amazing with Compel!

Need help? Check the documentation or review the code comments.

