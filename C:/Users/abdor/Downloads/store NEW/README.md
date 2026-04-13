# Store — Premium E-Commerce Platform

A production-grade, brand-agnostic e-commerce storefront with a hidden admin dashboard.  
Built with **Next.js 15** + **Supabase** + **Framer Motion**.

## Tech Stack

- **Frontend**: Next.js 15 (App Router, Server Components, Server Actions)
- **Backend**: Supabase (PostgreSQL + Storage)
- **Animations**: Framer Motion
- **Styling**: Vanilla CSS with CSS Custom Properties
- **Language**: TypeScript
- **Deployment**: Vercel

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Go to your [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor, and run the entire content of:

```
supabase/migrations/001_initial_schema.sql
```

This creates all tables, indexes, RLS policies, storage bucket, and triggers.

### 3. Environment Variables

The `.env.local` file is already configured. For Vercel deployment, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://avdritpwzelxjblwcgwh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Build for Production

```bash
npm run build
npm start
```

---

## Admin Dashboard Access

1. Scroll to the very bottom of any page (footer)
2. Find the tiny dot (`.`) next to "Developed by abdelhaned nada"
3. Click it — a login modal appears
4. Enter: `admin123321.com`
5. You'll be redirected to the admin dashboard at `/dashboard`

### Admin Features

- **Products**: Add/edit/delete products with multiple images, pricing, discounts, badges
- **Categories**: Organize products into categories
- **Settings**: Change store name, description, social links, hero content, currency
- **Reviews**: Add/approve/delete customer reviews
- **Banners**: Manage promotional banners
- **Overview**: Quick stats dashboard

---

## Deployment to Vercel

### Step-by-Step:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Framework: Next.js (auto-detected)

3. **Set Environment Variables**
   In Vercel Project Settings → Environment Variables, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

4. **Deploy**
   Click "Deploy" — Vercel will build and deploy automatically.

5. **Run Database Migration**
   Make sure you've run the SQL migration on your Supabase project.

---

## Folder Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── HomeClient.tsx        # Homepage client component  
│   ├── layout.tsx            # Root layout
│   ├── not-found.tsx         # 404 page
│   ├── globals.css           # Design system (1000+ lines)
│   ├── products/
│   │   ├── page.tsx          # Products listing
│   │   ├── ProductsClient.tsx
│   │   └── [slug]/
│   │       ├── page.tsx      # Product detail
│   │       └── ProductDetailClient.tsx
│   └── dashboard/
│       ├── page.tsx          # Admin dashboard
│       ├── layout.tsx        # Admin guard
│       └── DashboardClient.tsx  # Full admin panel (900+ lines)
├── components/
│   ├── animations/
│   │   ├── FadeIn.tsx
│   │   └── StaggerChildren.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── AnnouncementBar.tsx
│   │   └── ThemeToggle.tsx
│   └── shop/
│       ├── HeroSection.tsx
│       ├── ProductCard.tsx
│       ├── TrustBadges.tsx
│       └── Newsletter.tsx
├── hooks/
│   ├── useAdmin.ts
│   └── useTheme.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── admin.ts
│   ├── actions/
│   │   ├── products.ts
│   │   ├── categories.ts
│   │   ├── settings.ts
│   │   ├── reviews.ts
│   │   ├── banners.ts
│   │   └── upload.ts
│   └── utils.ts
└── types/
    └── index.ts
```

---

## Color System

### Light Mode (Default)
- Background: `#FAFAF7` (Off-white cream)
- Accent: `#8B6F47` (Deep warm brown)
- Text: `#1A1612` (Rich espresso)

### Dark AMOLED Mode
- Background: `#000000` (Pure black)
- Accent: `#C4A67D` (Warm gold)
- Text: `#F0EDE8` (Warm off-white)

---

## Developer

**abdelhaned nada**  
[Contact via WhatsApp](https://wa.me/message/64L5CHSAIA2DA1)
