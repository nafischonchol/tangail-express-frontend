# Next.js Architecture & Project Rules

1. **Server-First Strategy**:
   - Every route page (`page.tsx`) **MUST** be a **React Server Component (RSC)** by default.
   - Push `'use client'` down to the smallest possible leaf components (e.g., interactive modals, forms, filters). Static UI sections MUST remain Server Components.

2. **Component Granularity**:
   - Break down every route page into small, modular, single-responsibility sub-components (e.g., `AnnouncementBar`, `Header`, `HeroSection`, `BrandGrid`, `InquiryModal`). Avoid large monolithic page files.

3. **Import Path Alias (`@/`)**:
   - ALL imports across the codebase **MUST** use `@/` alias paths (e.g., `import X from "@/components/..."`). **NEVER** use relative imports (`./` or `../`).

4. **Single Admin & Customer Architecture**:
   - Protected admin routes are prefixed with `/admin`. Public customer routes belong in `app/(customer)/` using Route Groups.

5. **Component Directory Architecture (Outside `app/`)**:
   - ALL components **MUST** be stored in the root `components/` directory outside `app/` (e.g. `components/customer/home/CustomerHero.tsx`). Keep `app/` exclusively for routing (`page.tsx`, `layout.tsx`).
   - Categorize under `components/ui/`, `components/common/`, `components/layout/`, `components/customer/[page-name]/`, or `components/admin/[page-name]/`.

6. **Mandatory Responsive Design (Small, Medium, Large)**:
   - ALL designs and UI components **MUST** be fully responsive for Small (Mobile), Medium (Tablet), and Large (Desktop) screens using Tailwind CSS responsive breakpoints (`sm:`, `md:`, `lg:`, `xl:`).

7. **Mandatory `requestApi` Helper for All API Calls**:
   - ALL API calls in `lib/api/*.ts` **MUST** be made using the `requestApi()` helper function from `@/lib/api/client`. Never use raw `fetch()` or `apiFetch()` directly in components or actions.

8. **Git Operations Policy**:
   - **NO Git Commit / Push**: AI agents **MUST NOT** execute `git commit` or `git push` commands under any circumstances (`git commit and push kora jabe na`). All git commits and pushes must be performed manually by the developer.
<!-- END:nextjs-agent-rules -->
