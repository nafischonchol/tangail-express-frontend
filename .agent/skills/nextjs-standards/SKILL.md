---
name: nextjs-standards
description: Core standards, rules, and best practices for developing full-stack applications with Next.js 16+, App Router, React 19, and Tailwind CSS v4.
---

# Next.js 16+ App Router Standards & Development Guidelines

This document outlines the mandatory architecture, coding standards, and best practices to follow when working on this Next.js project.

---

## 1. Core Architecture & Routing (App Router)

- **App Directory (`app/`)**:
  - Use file-system based routing inside `app/`.
  - Special files: `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`.
  - Group routes logically using route groups `(group-name)` when layout sharing or grouping is required without affecting URL paths.
  - Use parallel routes `@folder` and intercepted routes `(.)folder` for complex UI flows (modals, split views) where necessary.

- **Panel Routing Standard (Admin vs Customer)**:
  - **Admin Panel**: Prefix all admin routes under `app/admin/` for explicit identification and isolated layout/auth protection (`/admin`, `/admin/inventory`, `/admin/orders`).
  - **Customer Panel**: Group customer routes under `app/(customer)/` using a Route Group so URLs remain clean without prefixing (`/`, `/products`, `/cart`, `/profile`).

---

## 2. Server vs Client Components & Component Granularity

- **Modular Component Decomposition (Granularity Standard)**:
  - **MANDATORY**: Break down every route page (`page.tsx`) into small, modular, single-responsibility sub-components (e.g., `AnnouncementBar`, `Navbar`, `HeroSection`, `BrandGrid`, `CatalogGrid`, `InquiryModal`).
  - Avoid large monolithic page files. Store route-specific sub-components in a `components/` subfolder inside the route directory or under `components/features/`.

- **Server-First Default Strategy**:
  - Keep page files (`page.tsx`) and static layout sections as **React Server Components (RSC)** by default for maximum SEO and performance.
  - Push `'use client'` boundaries down to the smallest possible leaf nodes (e.g., interactive filter bars, modal popups, interactive forms).
  - Static display sections (Hero banners, Brand showcases, Feature grids, Footers) **MUST** remain Server Components without `'use client'`.

---

## 3. Async Request APIs (Next.js 15/16+ Breaking Changes)

In Next.js 15+, dynamic runtime APIs are **asynchronous** and must be `await`ed before accessing their properties:

```tsx
// Page or Layout Params
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  return <div>Item ID: {id}</div>;
}
```

- Await `cookies()` and `headers()` when imported from `next/headers`:
  ```tsx
  import { cookies, headers } from 'next/headers';

  async function getUserSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    return token;
  }
  ```

---

## 4. Data Fetching & Server Actions

- **Fetching Data**:
  - Fetch data directly inside Server Components using native `fetch` or ORM/Database calls.
  - Utilize Next.js caching & revalidation options: `{ next: { revalidate: 3600, tags: ['products'] } }`.

- **Mutations (Server Actions)**:
  - Use `'use server'` functions for handling form submissions and data mutations.
  - Use `revalidatePath()` or `revalidateTag()` to purge cached data after updates.
  - Handle form pending state using `useActionState` or `useFormStatus` from `react-dom`.

---

## 5. Form & Schema Validation (Zod)

- **Mandatory Zod Validation**:
  - ALL form submissions, Server Actions payload, and external API inputs **MUST** be validated using **Zod schemas**.
  - Store reusable Zod schemas under `lib/schemas/` or `types/schemas/`.
  - Validate incoming data using `schema.safeParse(data)` before database queries or mutations:
  ```tsx
  import { z } from 'zod';

  export const ProductSchema = z.object({
    name: z.string().min(2, 'Product name is required'),
    price: z.number().positive('Price must be greater than 0'),
    quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  });

  export async function createProductAction(formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());
    const validated = ProductSchema.safeParse(rawData);

    if (!validated.success) {
      return { errors: validated.error.flatten().fieldErrors };
    }

    // Proceed with safe validated.data
  }
  ```

---

## 6. Directory & File Organization

## 6. Component Directory & File Organization

- **Root `components/` Placement (Outside `app/`)**:
  - **MANDATORY**: ALL components MUST be placed in the root `components/` directory outside `app/`. Keep `app/` exclusively for routing files (`page.tsx`, `layout.tsx`).

- **Categorized Folder Breakdown**:
  - **`components/ui/`**: Atomic, generic design-system primitives without business logic (e.g., `Button.tsx`, `Input.tsx`, `Card.tsx`, `Modal.tsx`, `Select.tsx`).
  - **`components/common/`**: Reusable business components shared across multiple pages or panels (e.g., `ProductCard.tsx`, `StatusBadge.tsx`, `Pagination.tsx`, `EmptyState.tsx`).
  - **`components/layout/`**: Layout structure components (e.g., `AdminSidebar.tsx`, `AdminTopbar.tsx`, `CustomerHeader.tsx`, `CustomerFooter.tsx`).
  - **`components/customer/[page-name]/`**: Customer-facing page-specific sections (e.g., `components/customer/home/CustomerHero.tsx`, `components/customer/home/BrandShowcase.tsx`).
  - **`components/admin/[page-name]/`**: Admin-facing page-specific sections (e.g., `components/admin/orders/StatusModal.tsx`).

```text
app/                            # App Router (ONLY routing: page.tsx, layout.tsx)
  admin/                        # Admin Panel pages (/admin/products, /admin/sales)
  (customer)/                   # Customer Panel pages (/, /products)
components/                     # ALL Project Components (Outside app/)
  ui/                           # Generic atomic UI (Button, Input, Card, Modal)
  common/                       # Shared business components (ProductCard, Pagination)
  layout/                       # Global Layouts (Sidebar, Topbar, Header, Footer)
  customer/                     # Customer page components
    home/                       # Home page components (CustomerHero, BrandShowcase)
  admin/                        # Admin page components
lib/                            # Utility functions, API helpers (lib/api/)
hooks/                          # Custom React hooks
types/                          # TypeScript interfaces and types
styles/                         # Global CSS stylesheets
```

---

## 7. Responsive Design & Styling (Tailwind CSS v4 & UI Aesthetics)

- **Mandatory 100% Responsiveness (Small, Medium, Large Screens)**:
  - ALL UI components and layouts **MUST** be fully responsive across all device sizes:
    - **Small (`sm:`, Mobile)**: Mobile-first layouts, stacked elements, touch-friendly touch targets, mobile drawers/collapsible menus.
    - **Medium (`md:`, Tablet)**: Adaptive 2-column or fluid grid/flex layouts, balanced spacing, tablet navigation.
    - **Large (`lg:`, `xl:`, Desktop)**: Full desktop layouts, multi-column grids, sidebar/main views, expansive hero sections.
  - Always design and test layouts for **Small**, **Medium**, and **Large** screen breakpoints (`sm:`, `md:`, `lg:`, `xl:`).

- **Tailwind CSS v4 & Styling Aesthetics**:
  - Use `@import "tailwindcss";` in `app/globals.css`.
  - Follow modern design aesthetics: glassmorphism, responsive grid/flexbox, dark mode compatibility, smooth transitions.
  - Use custom tokens and HSL colors for harmonious palettes. Avoid plain primary colors.

---

## 8. Performance & Optimization

- **Images**: Always use `<Image />` from `next/image` with explicit `width`/`height` or `fill`, correct `alt` text, and `priority` for above-the-fold images.
- **Fonts**: Use `next/font` (`next/font/google` or local fonts) in `layout.tsx` to prevent Cumulative Layout Shift (CLS).
- **Metadata (SEO)**: Export dynamic or static `metadata` objects from `page.tsx` or `layout.tsx` for optimal SEO and social media previews.

---

## 9. TypeScript & Quality Standards

- Keep strict type safety (`tsconfig.json`).
- Avoid using `any`; define explicit types/interfaces under `types/`.
- Handle errors gracefully using `error.tsx` boundaries and empty state indicators.

---

## 10. Import Paths & Aliases

- **Absolute Alias Import Standard (`@/`)**:
  - **MANDATORY**: ALL imports across the codebase **MUST** use the `@/` path alias (e.g. `import Component from "@/components/..."`, `import { helper } from "@/lib/..."`, or `import Client from "@/app/admin/..."`).
  - **NEVER** use relative imports (such as `./Component`, `../utils`, or `../../lib`) for project internal files.

