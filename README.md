# Compel - Commitment Goals with Real Stakes

A modern web application built with Next.js 15 that helps users achieve their goals through commitment contracts with monetary stakes.

## 📖 Documentation

> **👉 New here? Start with [START_HERE.md](START_HERE.md)**

- **[⭐ START_HERE.md](START_HERE.md)** - **READ THIS FIRST!** Quick 3-step setup
- **[🚀 QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes
- **[📘 GETTING_STARTED.md](GETTING_STARTED.md)** - Comprehensive getting started guide
- **[📊 PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete project overview
- **[🏗️ PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Architecture deep dive
- **[🚢 DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[🤝 CONTRIBUTING.md](CONTRIBUTING.md)** - Development guidelines

## 🎯 Overview

Compel is inspired by apps like Stickk and Beeminder. The key differentiator is that when users derail from their goals, the staked money can go to:
- A friend
- A charity
- An anti-charity (causes you oppose)
- Compel (us) - with a percentage fee

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
compel/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── goals/        # Goal CRUD operations
│   │   │   └── check-ins/    # Check-in operations
│   │   ├── auth/             # Authentication pages
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── dashboard/        # User dashboard
│   │   ├── goals/            # Goal management
│   │   │   ├── new/         # Create goal
│   │   │   └── [id]/        # Goal details
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Landing page
│   │   └── globals.css       # Global styles
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── auth/             # Auth components
│   │   ├── goals/            # Goal-related components
│   │   ├── dashboard/        # Dashboard components
│   │   └── layout/           # Layout components
│   ├── types/                # TypeScript type definitions
│   │   ├── database.types.ts # Supabase database types
│   │   └── index.ts          # Exported types
│   └── utils/                # Utility functions
│       └── supabase/         # Supabase clients
│           ├── client.ts     # Browser client
│           ├── server.ts     # Server client
│           └── middleware.ts # Middleware client
├── middleware.ts             # Next.js middleware
├── .env.local               # Environment variables
└── package.json             # Dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd compel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   
   Run the SQL schema from `database/schema.sql` in your Supabase SQL editor.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

### Tables

#### `profiles`
Stores user profile information.

#### `goals`
Core table for commitment goals with fields:
- `id`: UUID primary key
- `user_id`: Foreign key to auth.users
- `title`: Goal name
- `description`: Detailed description
- `stake_amount`: Money at risk
- `stake_recipient_type`: Where money goes (friend/charity/anti_charity/compel)
- `start_date` & `end_date`: Goal timeline
- `check_in_frequency`: How often to check in
- `status`: active/completed/failed/paused

#### `check_ins`
Tracks user check-ins for goals.

#### `transactions`
Records all financial transactions.

## 🎨 UI Components

The app includes a comprehensive component library:

- **Button**: Multiple variants (primary, secondary, danger, ghost)
- **Card**: Flexible card components with header, body, footer
- **Input**: Form input with labels and validation
- **Select**: Dropdown select with labels
- **Textarea**: Multi-line text input
- **Badge**: Status indicators

All components are fully typed with TypeScript and support dark mode.

## 🔐 Authentication

Authentication is handled by Supabase Auth:
- Email/Password sign up and login
- Protected routes with middleware
- Session management
- Automatic redirect for authenticated users

## 📱 Features

### Current Features

✅ User authentication (sign up, login, logout)
✅ Dashboard with goal statistics
✅ Goal creation with customizable stakes
✅ Goal management (view, edit, delete)
✅ Multiple stake recipient types
✅ Responsive design with dark mode
✅ Type-safe API routes
✅ Server-side rendering

### Planned Features

🔄 Check-in functionality with evidence upload
🔄 Payment integration (Stripe)
🔄 Email notifications
🔄 Goal progress tracking
🔄 Social features (accountability partners)
🔄 Analytics and insights
🔄 Mobile app

## 🎯 Core User Flow

1. **Sign Up**: User creates an account
2. **Create Goal**: Define commitment with monetary stake
3. **Set Stakes**: Choose recipient type for failed goals
4. **Regular Check-ins**: Prove progress at set intervals
5. **Complete or Fail**: 
   - Success: Get stake refunded
   - Failure: Stake goes to chosen recipient

## 🧪 Development

### Commands

```bash
# Development
npm run dev

# Build
npm run build

# Start production server
npm start

# Lint
npm run lint
```

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Keep components small and focused
- Use server components where possible
- Client components only when needed (interactivity)

## 📝 Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=       # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Your Supabase anon/public key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

Inspired by:
- [Stickk](https://www.stickk.com/)
- [Beeminder](https://www.beeminder.com/)

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Compel** - Put your money where your goals are. 💪
