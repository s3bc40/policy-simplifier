# Policy Simplifier

A modern web application that uses **Gemini AI** to simplify complex security policies into actionable internal memos. Built with **Next.js 16**, **Stripe** for credit purchases, and **Supabase** for authentication and data storage.

## 🎯 Project Overview

Policy Simplifier helps organizations communicate security policies to non-technical audiences. Instead of lengthy, complex policy documents, users get:

- **Clear internal memos** with simplified language
- **Top 3 risks** if the policy is ignored
- **Actionable requirements** with specific next steps
- **Target audience** identification (Employees, Leadership, Technical Team)

### Use Cases

- Security teams need to communicate policies to employees
- Leadership needs quick policy summaries
- Compliance officers need risk assessments
- Internal training and awareness programs

## ✨ Key Features

- ✅ **AI-Powered Analysis** - Gemini 2.5 Flash generates structured policy summaries
- ✅ **Credit System** - Users get 5 free credits, can purchase more via Stripe
- ✅ **Secure Auth** - Email/password + OAuth (GitHub/Google) via Supabase
- ✅ **Real-time Billing** - Stripe webhook integration for instant credit updates
- ✅ **Loading Skeletons** - Professional UX with animated loaders
- ✅ **Dark Mode** - Full light/dark theme support
- ✅ **Responsive Design** - Works on mobile, tablet, desktop

## 🛠️ Tech Stack

| Layer        | Technology                                  |
| ------------ | ------------------------------------------- |
| **Frontend** | Next.js 16, React 19, TypeScript            |
| **AI**       | Google Gemini 2.5 Flash (via Vercel AI SDK) |
| **Auth**     | Supabase Auth (SSR-compatible)              |
| **Database** | Supabase PostgreSQL                         |
| **Payments** | Stripe (webhooks for real-time updates)     |
| **Styling**  | Tailwind CSS, shadcn/ui components          |
| **Testing**  | Playwright                                  |

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** and **pnpm**
- **Supabase account** (free tier available)
- **Stripe account** (test mode)
- **Google Gemini API key** (free tier available)
- **Stripe CLI** (for local webhook testing)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository>
cd policy-simplifier
pnpm install
```

### 2. Environment Setup

Create `.env.local` in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gemini AI
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Custom Stripe Price IDs
STRIPE_PRICE_CREDITS_20=price_...
STRIPE_PRICE_CREDITS_75=price_...
STRIPE_PRICE_CREDITS_200=price_...
```

### 3. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run migrations in SQL editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  credits INTEGER DEFAULT 5,
  stripe_customer_id TEXT,
  subscription_tier TEXT DEFAULT 'FREE',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create credits_history table for audit log
CREATE TABLE credits_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  amount INTEGER,
  reason TEXT,
  stripe_event_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits_history ENABLE ROW LEVEL SECURITY;
```

3. Copy connection details to `.env.local`

### 4. Stripe Setup

See [STRIPE_SETUP.md](./STRIPE_SETUP.md) for detailed instructions:

**Quick summary:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create a product "Policy Simplifier Credits" with 3 prices:
   - 20 credits: $2.99
   - 75 credits: $9.99
   - 200 credits: $24.99
3. Copy price IDs to `.env.local`
4. Set up webhook endpoint for `checkout.session.completed`

### 5. Gemini AI Setup

1. Get API key at [Google AI Studio](https://aistudio.google.com/apikey)
2. Add to `.env.local`: `GOOGLE_GENERATIVE_AI_API_KEY=...`

### 6. Run Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🧪 Testing the App

### Test Scenario 1: Sign Up & Free Credits

1. Go to `/auth/signup`
2. Create account with test email
3. Profile created with 5 free credits
4. Visit `/summarize` - you have 5 credits available

### Test Scenario 2: Policy Analysis

1. Go to `/summarize`
2. Paste a security policy (minimum 100 characters)
3. Click "Analyze Policy" - see loading skeleton
4. View AI-generated summary with risks and requirements
5. Click "New Analysis" to reset and try another policy
6. Credits decrease each time

**Sample policy to test:**

```
INFORMATION SECURITY POLICY

1. Access Control
All employees must use strong passwords with a minimum of 12 characters, including uppercase, lowercase, numbers, and special characters. Multi-factor authentication (MFA) is mandatory for all systems accessing sensitive company data. Access to production environments must be approved through a formal request process and logged for audit purposes. Employee access must be revoked within 24 hours of termination or role change.

2. Data Protection
All sensitive company information must be encrypted both in transit (TLS 1.2 or higher) and at rest (AES-256). Employees are prohibited from storing company data on personal devices. Database backups must be created daily. Encryption keys must be rotated quarterly.

3. Incident Response
Any suspected security breach must be reported to the Security team immediately. Affected customers must be notified within 24 hours if their data is compromised. A formal post-incident report must be completed within 5 business days.
```

### Test Scenario 3: Purchase Credits via Stripe

1. Go to `/billing`
2. Click "Buy Now" on any tier
3. Use Stripe test card: `4242 4242 4242 4242`
4. Expiry: any future date, CVC: any 3 digits
5. After payment completes:
   - Webhook fires
   - Credits added instantly
   - Redirect to `/billing?success=true`
6. Check Supabase `credits_history` table for transaction log

### Test Scenario 4: Local Webhook Testing

```bash
# Terminal 1: Run dev server
pnpm dev

# Terminal 2: Listen for Stripe webhooks
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI shows webhook signing secret - add to `.env.local` if needed. When you process a test payment, the webhook automatically fires and credits are awarded.

## 📁 Project Structure

```
policy-simplifier/
├── app/
│   ├── api/
│   │   ├── webhooks/stripe/          # Stripe webhook handler
│   │   ├── fulfill-payment/          # Credit fulfillment (empty - handled via webhook)
│   │   └── auth/                     # Auth routes
│   ├── actions/
│   │   ├── checkout.ts               # Create Stripe session
│   │   └── summarize.ts              # AI policy analysis (server action)
│   ├── auth/                         # Auth pages (login, signup, oauth)
│   ├── billing/                      # Billing & credit purchase page
│   └── summarize/                    # Main policy summarization page
├── components/
│   ├── login-form.tsx                # Login form with OAuth
│   ├── signup-form.tsx               # Signup form
│   ├── summarize-form.tsx            # Policy input & results (with skeleton)
│   └── ui/                           # shadcn/ui components
├── lib/
│   ├── schemas.ts                    # Zod schemas for validation
│   ├── utils.ts                      # Utility functions
│   ├── stripe/
│   │   └── client.ts                 # Stripe configuration & pricing
│   └── supabase/
│       ├── client.ts                 # Client-side Supabase
│       ├── server.ts                 # Server-side Supabase (SSR)
│       ├── admin.ts                  # Admin Supabase (service role)
│       └── proxy.ts                  # Middleware for auth
└── tests/                            # Playwright E2E tests
```

## 🔑 Key Implementation Details

### How It Works

1. **User Signs Up** → 5 free credits added
2. **User Analyzes Policy** → Server action calls Gemini AI
3. **AI Generates Summary** → Structured JSON with risks, requirements, next steps
4. **Credit Deducted** → 1 credit deducted via Supabase admin client
5. **User Buys Credits** → Creates Stripe checkout session
6. **Payment Completes** → Stripe webhook fires `checkout.session.completed`
7. **Webhook Handler** → Updates user profile with purchased credits
8. **Credits Reflected** → User sees updated balance immediately

### Critical Files to Review

- **[app/api/webhooks/stripe/route.ts](./app/api/webhooks/stripe/route.ts)** - Webhook handler that awards credits
- **[app/actions/summarize.ts](./app/actions/summarize.ts)** - AI policy analysis logic with Gemini
- **[components/summarize-form.tsx](./components/summarize-form.tsx)** - UI with skeleton loader & reset button
- **[lib/supabase/proxy.ts](./lib/supabase/proxy.ts)** - Middleware that protects routes while allowing webhooks
- **[app/auth/login/page.tsx](./app/auth/login/page.tsx)** - Suspense boundary for SSR compatibility

### Notable Bug Fixes Applied

- ✅ **Webhook 307 redirects** - Fixed by excluding `/api/webhooks/*` from auth middleware
- ✅ **useSearchParams SSR error** - Fixed by wrapping in `useEffect` and adding `<Suspense>` boundary
- ✅ **Credit amounts mismatch** - Fixed webhook to match checkout price keys (20/75/200)

## 🧑‍💻 Code Quality

```bash
# Run tests
pnpm test

# Run linter
pnpm lint

# Build for production
pnpm build
```

## 📊 API Endpoints

| Method | Endpoint               | Description                                   |
| ------ | ---------------------- | --------------------------------------------- |
| POST   | `/api/webhooks/stripe` | Handles Stripe events (credit fulfillment)    |
| GET    | `/auth/login`          | Login page                                    |
| GET    | `/auth/signup`         | Signup page                                   |
| POST   | `/auth/oauth`          | OAuth callback handler                        |
| GET    | `/summarize`           | Main app page                                 |
| POST   | `/summarize`           | Policy analysis (via server action)           |
| GET    | `/billing`             | Billing & credit purchase page                |
| POST   | `/billing`             | Checkout session creation (via server action) |

## 🔐 Security Considerations

- ✅ All API routes use Supabase RLS policies
- ✅ Webhook signature verification via Stripe
- ✅ Admin client never exposed to frontend
- ✅ SSR-safe auth middleware
- ✅ CSRF protection via Next.js
- ✅ Environment variables for secrets

## 📈 Future Enhancements

- [ ] Export summaries as PDF
- [ ] Save policy history
- [ ] Policy comparison tool
- [ ] Team collaboration
- [ ] Advanced analytics dashboard
- [ ] Subscription plans (monthly/yearly)
- [ ] API for third-party integrations

## 📝 License

MIT

## 🤝 Contributing

Found a bug? Have a suggestion? Please open an issue or submit a PR!

---

**Built with ❤️ using Next.js 16, Gemini AI, Stripe, and Supabase**
