# Frontend Color Palette & Design System Guide

> **Theme**: K-Beauty / Korean Cosmetics E-Commerce (Minimalist & High-Density)  
> **Target Audience**: Primarily female customers looking for premium, authentic Korean skincare and cosmetics.

---

## 1. Brand Color Overview

The primary accent color for the store is a soft, elegant berry/rose tone (**`#D062A5`**). It reflects modern K-beauty aesthetics—warm, feminine, editorial, and sophisticated without being aggressive or neon.

| Token / Role | Hex Code | Tailwind / OKLCH Equiv | Purpose / UI Placement |
| :--- | :--- | :--- | :--- |
| **Primary Accent** | `#D062A5` | `pink-500` / `rose-400` | Badges, tags, active navigation pills, brand highlights, subtle icons |
| **Primary CTA (Buttons)** | `#BA478F` | Deep Berry Rose | Primary buttons (Add to Cart, Buy Now, Checkout) to ensure WCAG AA contrast with white text |
| **Primary Hover / Active**| `#9F3375` | Dark Berry | Hover and active pressed states on primary buttons and links |
| **Subtle Tint (Background)** | `#FDF2F8` | `pink-50` | Soft highlight banners, active filter chips, free-shipping announcement pill |
| **Border Accent (Subtle)** | `#F472B6` / `#FBCFE8` | `pink-200` | Subtle focus rings, active tab bottom borders, soft card highlights |

---

## 2. Neutral Base & Structural Hierarchy

In accordance with anti-AI slop and high-utility design standards, backgrounds remain crisp and monochrome so product imagery stands out.

| Element | Light Mode Hex | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- |
| **Page Canvas / Body** | `#FAFAFA` | `bg-neutral-50` / `bg-zinc-50` | Main application background |
| **Card / Surface** | `#FFFFFF` | `bg-white` | Product cards, dialogs, dropdowns, headers |
| **Primary Headings & Text** | `#18181B` | `text-zinc-900` | Main titles, product names, price values |
| **Muted / Secondary Text** | `#71717A` | `text-zinc-500` | Sub-labels, size/volume info, reviews count, timestamps |
| **Structural Borders** | `#E4E4E7` | `border-zinc-200` | Card boundaries, dividers, table rows, input borders |
| **Disabled / Inactive Surface**| `#F4F4F5` | `bg-zinc-100` | Disabled buttons, skeleton loaders, subtle hover backgrounds |

---

## 3. Accessibility & Contrast Standards (WCAG AA)

1. **Button Text Contrast**:
   - `#D062A5` with pure white text (`#FFFFFF`) has a contrast ratio of approx `3.6:1` (passes 3:1 for large text/buttons, but borderline for small text).
   - For primary action buttons (`Add to Cart`, `Checkout`), use **`#BA478F`** or **`#B8488E`** to reach `>= 4.5:1` contrast with white text.
2. **Text over Light Pink Tint (`#FDF2F8`)**:
   - Use `#9F3375` or `#18181B` for text inside light pink badges or banners. Do **not** use light text over light pink backgrounds.
3. **Form Inputs & Interactive Rings**:
   - Ensure focus rings on input fields use `ring-zinc-400` or `ring-[#D062A5]/50` for clear visual feedback.

---

## 4. Usage Guidelines & Anti-Slop Rules

* **Single Functional Accent**:
  - Keep the berry pink accent functional. Use it exclusively to guide the user's eye to primary actions (CTAs, cart counters, active category filters).
* **No Decorative Gradients**:
  - Avoid generic purple-to-pink gradient backgrounds or neon glowing shadows. Use clean borders (`border-zinc-200`) and subtle shadows (`shadow-sm`).
* **Photography First**:
  - Korean cosmetics products have elegant packaging. Keep the canvas clean (white / light zinc) to let product photos be the focal point.
* **Badges & Labels**:
  - `BESTSELLER`, `NEW`, or `SALE` tags should use compact pill badges with subtle borders and clear typography.

---

## 5. Quick Tailwind CSS Reference Snippets

### Primary Action Button
```tsx
<button className="h-10 px-4 rounded-md bg-[#BA478F] hover:bg-[#9F3375] text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D062A5] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none">
  Add to Cart
</button>
```

### Soft Category / Promo Badge
```tsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FDF2F8] text-[#9F3375] border border-[#FBCFE8]">
  K-Beauty Pick
</span>
```

### Active Navigation / Filter Pill
```tsx
<button className="px-3 py-1.5 text-xs font-medium rounded-full bg-[#BA478F] text-white">
  Serums & Ampoules
</button>
```
