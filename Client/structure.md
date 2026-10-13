# Next.js Latest Root-level Project Structure (Without `src/`)

This document outlines the industry-standard project structure for a modern Next.js (App Router) multi-role marketplace application (such as MediStore or SkillBridge) using a root-level architecture.

## Current FoodHub implementation

The tree below is a reference scaffold, not a list of required folders. FoodHub
uses `store/api/` for RTK Query requests and `lib/` for shared helpers; unused
`services/`, `utils/`, and `app/api/` placeholders have been removed.

Only the currently used UI primitives are retained in `components/ui/`:
button, card, input, textarea, and tooltip. Add further primitives through
shadcn when a feature needs them. `lib/utils.ts` remains the utility alias used
by `components.json` for generated components.

Unused starter SVG assets and empty asset directories have been removed.
Create `public/` again when adding local static assets; the favicon remains
in `app/favicon.ico`.

## 📂 Directory Layout

```text
my-marketplace-client/
├── public/                  # Static assets (Images, Icons, Favicon)
│   ├── images/
│   └── icons/
│
├── app/                     # App Router (Root Level File-Based Routing)
│   ├── (auth)/              # Unprotected Route Group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   │
│   ├── (public)/            # Public Pages
│   │   ├── page.tsx         # Home Landing Page
│   │   ├── shop/            # (MediStore) or /tutors (SkillBridge)
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── categories/
│   │
│   ├── (dashboard)/         # Protected Dashboard Routes (Role-based)
│   │   ├── customer/        # Customer / Student Dashboard
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   └── orders/
│   │   │
│   │   ├── seller/          # Seller / Tutor Dashboard
│   │   │   ├── medicines/
│   │   │   └── orders/
│   │   │
│   │   └── admin/           # Admin Dashboard
│   │       ├── users/
│   │       └── categories/
│   │
│   ├── api/                 # Next.js Route Handlers (If needed for proxy/BFF)
│   ├── layout.tsx           # Root Layout (Providers, Navbar, Footer, Fonts)
│   ├── loading.tsx          # Global Loading UI
│   ├── error.tsx            # Global Error Boundary
│   ├── not-found.tsx        # Custom 404 Page
│   └── globals.css          # Tailwind CSS / Global Styles
│
├── components/              # Reusable React Components
│   ├── ui/                  # Shadcn UI / Primitive Components (Button, Input, Modal)
│   ├── shared/              # Global Layout Components (Navbar, Footer, Sidebar)
│   └── modules/             # Feature-Specific Components (e.g., MedicineCard, OrderTable)
│
├── services/                # API Call Layer (Axios / Fetch Wrappers)
│   ├── auth.service.ts
│   ├── medicine.service.ts  # (or tutor.service.ts)
│   └── order.service.ts
│
├── store/                   # Global State Management (Zustand / Redux Toolkit)
│   ├── authStore.ts
│   └── cartStore.ts
│
├── hooks/                   # Custom React Hooks (useAuth, useDebounce)
│   └── useUser.ts
│
├── types/                   # TypeScript Type Definitions & Interfaces
│   ├── user.type.ts
│   ├── medicine.type.ts
│   └── order.type.ts
│
├── utils/                   # Helper / Utility Functions
│   ├── formatCurrency.ts
│   └── cn.ts                # Tailwind Class Merger Utility
│
├── middleware.ts            # Next.js Route Protection & Role-Based Auth Middleware
├── .env.local               # Local Environment Variables
├── tailwind.config.ts       # Tailwind CSS Configuration
├── tsconfig.json            # TypeScript Config (Alias mapping)
└── package.json
```

## ⚙️ TypeScript Alias Setup (`tsconfig.json`)

Since there is no `src/` folder, configure path mapping in your `tsconfig.json` so you can clean-import files using `@/*`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Example Imports:
```typescript
// Components
import { Button } from "@/components/ui/button";
// Services
import { getMedicines } from "@/services/medicine.service";
// Types
import { IMedicine } from "@/types/medicine.type";
```

## 💡 Key Highlights
1. **Root-Level `app/`:** File-based routing directly under the root directory.
2. **`components/modules/`:** Keeps large feature components separate from primitive UI elements.
3. **`middleware.ts`:** Handles role-based protection at the root level for `CUSTOMER`, `SELLER`, and `ADMIN` routes.