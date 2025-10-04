# Compel Project Structure

Complete overview of the project organization and architecture.

## 📁 Directory Tree

```
compel/
├── .next/                      # Next.js build output (generated)
├── node_modules/              # Dependencies (generated)
├── public/                    # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── database/                  # Database schemas and migrations
│   └── schema.sql            # Complete database schema
├── src/                      # Source code
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes (server-side)
│   │   │   ├── goals/      # Goal CRUD operations
│   │   │   │   ├── route.ts              # GET & POST /api/goals
│   │   │   │   └── [id]/route.ts         # GET, PATCH, DELETE /api/goals/:id
│   │   │   └── check-ins/  # Check-in operations
│   │   │       └── route.ts              # POST /api/check-ins
│   │   ├── auth/           # Authentication pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx             # Login page
│   │   │   └── signup/
│   │   │       └── page.tsx             # Signup page
│   │   ├── dashboard/      # Dashboard
│   │   │   └── page.tsx                 # Main dashboard (server component)
│   │   ├── goals/          # Goal management
│   │   │   ├── page.tsx                 # Goals list (server component)
│   │   │   ├── new/
│   │   │   │   └── page.tsx             # Create goal (server component)
│   │   │   └── [id]/       # Dynamic goal detail (future)
│   │   ├── favicon.ico     # App favicon
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Landing page
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   │   ├── Badge.tsx             # Status badges
│   │   │   ├── Button.tsx            # Button component
│   │   │   ├── Card.tsx              # Card components
│   │   │   ├── Input.tsx             # Input field
│   │   │   ├── Select.tsx            # Select dropdown
│   │   │   ├── Textarea.tsx          # Textarea field
│   │   │   └── index.ts              # Barrel exports
│   │   ├── auth/          # Authentication components
│   │   │   └── AuthForm.tsx          # Login/Signup form (client)
│   │   ├── dashboard/     # Dashboard components
│   │   │   └── StatsCard.tsx         # Statistics card
│   │   ├── goals/         # Goal-related components
│   │   │   ├── CreateGoalForm.tsx    # Goal creation form (client)
│   │   │   └── GoalCard.tsx          # Goal display card
│   │   └── layout/        # Layout components
│   │       └── Navigation.tsx        # Main navigation (client)
│   ├── types/             # TypeScript definitions
│   │   ├── database.types.ts         # Supabase database types
│   │   └── index.ts                  # Exported types
│   └── utils/             # Utility functions
│       └── supabase/      # Supabase clients
│           ├── client.ts             # Browser client
│           ├── server.ts             # Server client
│           └── middleware.ts         # Middleware client
├── .env.local             # Environment variables (not in git)
├── .gitignore            # Git ignore rules
├── eslint.config.mjs     # ESLint configuration
├── middleware.ts         # Next.js middleware
├── next-env.d.ts         # Next.js TypeScript declarations
├── next.config.ts        # Next.js configuration
├── package.json          # Project dependencies
├── package-lock.json     # Locked dependencies
├── postcss.config.mjs    # PostCSS configuration
├── tsconfig.json         # TypeScript configuration
├── README.md             # Main documentation
├── QUICKSTART.md         # Quick start guide
├── DEPLOYMENT.md         # Deployment guide
├── CONTRIBUTING.md       # Contribution guidelines
└── PROJECT_STRUCTURE.md  # This file
```

## 🏗️ Architecture Overview

### Frontend Architecture

```
┌─────────────────────────────────────┐
│         Landing Page                │
│       (Public Route)                │
└─────────────────────────────────────┘
                 │
                 ├──→ Sign Up / Login
                 │
                 ▼
┌─────────────────────────────────────┐
│      Dashboard (Protected)          │
│   ┌─────────────────────────────┐  │
│   │   Stats Cards               │  │
│   │   Recent Goals              │  │
│   └─────────────────────────────┘  │
└─────────────────────────────────────┘
                 │
                 ├──→ My Goals
                 ├──→ Create Goal
                 └──→ Goal Details (future)
```

### Backend Architecture

```
┌─────────────────────────────────────┐
│      Next.js API Routes             │
│                                     │
│   /api/goals                       │
│   /api/goals/[id]                  │
│   /api/check-ins                   │
└─────────────────────────────────────┘
                 │
                 │ Supabase Client
                 ▼
┌─────────────────────────────────────┐
│        Supabase (PostgreSQL)        │
│                                     │
│   • profiles                       │
│   • goals                          │
│   • check_ins                      │
│   • transactions                   │
└─────────────────────────────────────┘
```

### Authentication Flow

```
User Action → Next.js Middleware → Supabase Auth
                   │
                   ├──→ Authenticated: Continue
                   └──→ Not Authenticated: Redirect to /auth/login
```

## 📝 File Responsibilities

### App Router (`src/app/`)

| File/Folder | Type | Purpose | Key Features |
|-------------|------|---------|--------------|
| `page.tsx` | Server | Landing page | Hero, features, CTA |
| `layout.tsx` | Server | Root layout | Font setup, metadata |
| `dashboard/page.tsx` | Server | Dashboard | Stats, recent goals |
| `goals/page.tsx` | Server | Goals list | All user goals |
| `goals/new/page.tsx` | Server | Create goal | Goal creation form |
| `auth/login/page.tsx` | Server | Login | Auth form |
| `auth/signup/page.tsx` | Server | Signup | Auth form |

### API Routes (`src/app/api/`)

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/goals` | GET, POST | List all goals, Create goal |
| `/api/goals/[id]` | GET, PATCH, DELETE | Get, Update, Delete goal |
| `/api/check-ins` | POST | Create check-in |

### Components (`src/components/`)

#### UI Components
- **Button**: Reusable button with variants
- **Card**: Container component with sections
- **Input**: Form input with validation
- **Select**: Dropdown with options
- **Textarea**: Multi-line input
- **Badge**: Status indicator

#### Feature Components
- **AuthForm**: Login/signup logic
- **CreateGoalForm**: Goal creation logic
- **GoalCard**: Display goal information
- **StatsCard**: Dashboard statistics
- **Navigation**: App navigation bar

### Types (`src/types/`)

```typescript
// Database table types
type Profile, Goal, CheckIn, Transaction

// Enum types
type StakeRecipientType, CheckInFrequency, GoalStatus

// Extended types
type GoalWithCheckIns, DashboardStats
```

### Utils (`src/utils/`)

```typescript
// Supabase client creation
createClient() // For different contexts
```

## 🔄 Data Flow

### Creating a Goal

```
1. User fills form → CreateGoalForm (client)
2. Form submits → /api/goals (server)
3. API validates → Supabase insert
4. Success → Redirect to /goals
5. Page loads → Fetch goals from Supabase
6. Render → GoalCard components
```

### Authentication

```
1. User submits credentials → AuthForm (client)
2. Supabase Auth API call
3. Set cookie → Middleware validates
4. Redirect → Dashboard
```

## 🎨 Styling System

### Tailwind Utility Classes

```css
/* Colors */
bg-blue-600     /* Primary */
bg-gray-800     /* Dark mode background */
text-gray-900   /* Primary text */

/* Spacing */
p-6            /* Padding */
mt-4           /* Margin top */
gap-4          /* Grid/Flex gap */

/* Dark Mode */
dark:bg-gray-800
dark:text-white
```

### Component Variants

```typescript
// Button variants
'primary' | 'secondary' | 'danger' | 'ghost'

// Card variants
'default' | 'bordered' | 'elevated'

// Badge variants
'success' | 'warning' | 'danger' | 'info' | 'default'
```

## 🔐 Security Layers

### 1. Middleware
- Validates Supabase session
- Redirects unauthenticated users

### 2. Row Level Security (RLS)
- Database-level access control
- Users can only see their own data

### 3. API Route Protection
- Checks authentication on every request
- Validates user ownership

### 4. Type Safety
- TypeScript prevents type errors
- Supabase types ensure database schema match

## 🚀 Build Process

```
1. TypeScript Compilation
2. Next.js Bundling
3. Tailwind CSS Processing
4. Image Optimization
5. Route Generation
6. Static Export (optional)
```

## 📦 Key Dependencies

### Production
- `next@15.5.4` - React framework
- `react@19.1.0` - UI library
- `@supabase/ssr` - Supabase SSR
- `@supabase/supabase-js` - Supabase client

### Development
- `typescript@5` - Type safety
- `tailwindcss@4` - Styling
- `eslint@9` - Code quality

## 🔮 Future Structure

```
src/
├── app/
│   ├── goals/
│   │   └── [id]/
│   │       └── page.tsx          # Goal detail view
│   ├── profile/
│   │   └── page.tsx              # User profile
│   └── settings/
│       └── page.tsx              # App settings
├── components/
│   ├── check-ins/
│   │   └── CheckInForm.tsx       # Check-in component
│   └── payments/
│       └── StripeCheckout.tsx    # Payment integration
├── lib/
│   ├── stripe.ts                 # Stripe utilities
│   └── email.ts                  # Email utilities
└── hooks/
    ├── useGoals.ts               # Goals hook
    └── useCheckIns.ts            # Check-ins hook
```

## 📚 File Naming Conventions

- **Components**: PascalCase (e.g., `GoalCard.tsx`)
- **Routes**: lowercase (e.g., `page.tsx`, `route.ts`)
- **Utils**: camelCase (e.g., `formatDate.ts`)
- **Types**: PascalCase (e.g., `database.types.ts`)
- **Config**: lowercase (e.g., `next.config.ts`)

## 🎯 Import Aliases

```typescript
// Configured in tsconfig.json
"@/components/*"  → "src/components/*"
"@/utils/*"       → "src/utils/*"
"@/types/*"       → "src/types/*"
"@/app/*"         → "src/app/*"
```

---

This structure provides a solid foundation for scaling Compel as it grows! 🚀

