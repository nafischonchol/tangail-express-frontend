---
name: mohimaa-frontend
description: "Core frontend architecture and API guidelines for MohimaaWarehouse Next.js frontend."
license: MIT
metadata:
  author: nextjs
---

# MohimaaWarehouse Frontend Architecture & API Guidelines

This skill outlines the core frontend architecture, conventions, and API client standards for MohimaaWarehouse.

## When to Apply

Activate this skill when working on:
- Frontend Next.js pages, layouts, and components.
- State management and hooks (`useCartStore`, `useWishlistStore`, `useCustomerAuth`).
- API requests in `lib/api/*.ts`.

---

## 1. Mandatory `requestApi` Helper for All API Calls

All frontend API calls in `lib/api/*.ts` MUST use the central `requestApi` helper function defined in [`lib/api/client.ts`](file:///home/nafis/projects/Mohimaa-warehouse/frontend/lib/api/client.ts).

- **Mandatory Usage**: Do NOT use raw `fetch()` or custom fetch implementations in `lib/api/*.ts`. Always use `requestApi<T>()` to ensure standardized base URL handling (`NEXT_PUBLIC_API_BASE_URL`), error handling, query parameter serialization, and uniform `ApiResponse<T>` return shapes (`{ success, message, resources }`).
- **Authenticated Requests**: For customer or admin authenticated endpoints, pass the authorization bearer token via the `headers` option (e.g., `headers: { Authorization: 'Bearer ' + token }`) or use the `isPublic` flag appropriately.

---

## 2. Server-First Strategy & Component Architecture

- **RSC Default**: Every route page (`page.tsx`) MUST be a React Server Component (RSC) by default.
- **Granular Leaf Components**: Push `'use client'` down to the smallest possible leaf components (modals, forms, interactive widgets).
- **Import Alias**: ALL imports across the frontend MUST use `@/` alias paths (e.g. `@/components/...`).
- **Component Directory**: Store reusable components under `components/` (outside `app/`), categorizing under `components/customer/`, `components/admin/`, `components/ui/`, or `components/layout/`.

---

## 3. Git Operations Policy

- **NO Git Commit / Push**: Do NOT execute `git commit` or `git push` commands under any circumstances (`git commit and push kora jabe na`). All git commits and pushes must be performed manually by the user/developer.

