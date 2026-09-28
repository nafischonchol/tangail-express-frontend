---
name: project-skills
description: Main agent skill configuration for mohimaa-warehouse-frontend project adhering to Next.js 16+, App Router, React 19, and Tailwind CSS v4 standards.
---

# Project Agent Skills & Rules

This project follows Next.js 16+ App Router, React 19, and Tailwind CSS v4 standards.

- [.agent/skills/nextjs-standards/SKILL.md](skills/nextjs-standards/SKILL.md)

## Summary Guidelines
1. **Routing Architecture**: Admin panel routes MUST be prefixed under `app/admin/` (`/admin/*`). Customer routes MUST be grouped under `app/(customer)/` using Route Groups for clean URLs (`/`, `/products`).
2. **Form & Data Validation (Zod)**: ALL forms, API inputs, and Server Action payloads MUST be validated using `zod` schemas (stored in `lib/schemas/`).
3. **Server vs Client Components**: Default to Server Components. Use `'use client'` only for interactive leaf components.
4. **Async Dynamic APIs**: `params`, `searchParams`, `cookies()`, and `headers()` must be `await`ed in Next.js 15/16+.
5. **Data Fetching**: Use Server Actions (`'use server'`) for mutations and native `fetch` with tags/revalidation for data querying.
6. **Styling**: Modern UI styling using Tailwind CSS v4 and responsive visual design.
7. **Folder Architecture**: Keep `app/admin`, `app/(customer)`, `components/` (ui, features, shared), `lib/schemas/`, `hooks/`, and `types/` cleanly separated.
