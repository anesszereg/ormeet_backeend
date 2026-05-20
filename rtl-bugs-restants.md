# RTL Visual Bugs — Landing `/ar` Page (Residual)

> Produced after the bulk Tailwind logical-property migration.
> All issues below require manual fixes; they were intentionally left out
> of the automated pass to avoid regressions on `/en` and `/fr`.

---

## Bug 1 — `PaginationControls`: chevron arrows point in the wrong direction  
**Severity**: high  
**Affects**: TrendingEvents, EventsInCalifornia, DiscoverSection, FindYourVibe, Testimonials (all 5 paginated sections)

**Root cause**: `landing-page/src/components/ui/PaginationControls.tsx`  
The "Previous" and "Next" buttons contain inline SVG chevrons (`M10 12 L6 8 L10 4` and `M6 4 L10 8 L6 12`) that are hardcoded for LTR. In RTL, the visual meaning is reversed but the arrows still point left and right respectively.

**Fix**:
```tsx
// Previous button SVG
<svg className="rtl:scale-x-[-1]" ...>

// Next button SVG
<svg className="rtl:scale-x-[-1]" ...>
```

---

## Bug 2 — `EventCarousel`: nav arrow SVG images don't flip  
**Severity**: high  
**Affects**: `landing-page/src/components/EventCarousel.tsx`

**Root cause**: The carousel nav buttons use `<Image>` components with static SVG files (`/svgs/landingPage/pastEvent.svg`, `/svgs/landingPage/nextEvent.svg`). In RTL, CSS logical positioning (`start-[...]` / `end-[...]`) correctly mirrors the button positions, but the SVG files themselves still point in the original LTR directions — so the left-arrow appears on the right side and vice versa.

Additionally, the JavaScript handlers (`handlePrev` decrements, `handleNext` increments) may feel counter-intuitive in RTL because Arabic reading order expects "next" to move left.

**Fix**:
```tsx
// Both nav Image wrappers — wrap in a mirroring span:
<span className="rtl:scale-x-[-1] block">
  <Image src="/svgs/landingPage/pastEvent.svg" ... />
</span>
```

---

## Bug 3 — `StarRating`: half-star gradient is LTR-only  
**Severity**: low  
**Affects**: `landing-page/src/components/Testimonials.tsx` — `StarRating` sub-component

**Root cause**: The partial star is rendered with an SVG `linearGradient` (`offset="50%"` orange then gray). The gradient has no `gradientTransform` for RTL. In RTL, the filled half should appear on the right side of the star rather than the left.

**Fix**:
Add a `gradientTransform` or mirror the gradient stops conditionally based on `dir`:
```tsx
import { useLocale } from 'next-intl';
const locale = useLocale();
const isRtl = locale === 'ar';
// then in SVG:
<linearGradient gradientTransform={isRtl ? 'scale(-1 1) translate(-1 0)' : undefined}>
```

---

## Bug 4 — `Sidebar` (front-end): react-icons arrows don't flip  
**Severity**: medium  
**Affects**: `front-end/src/components/Sidebar.tsx`

**Root cause**: The collapse/expand toggle uses `BsFillArrowLeftCircleFill` / `BsFillArrowRightCircleFill` from `react-icons/bs`. In RTL, the sidebar expands from the right edge, so the arrow directions should be inverted.

**Fix**: Add `className="rtl:scale-x-[-1]"` to both icons:
```tsx
<BsFillArrowRightCircleFill size={24} className="rtl:scale-x-[-1]" />
<BsFillArrowLeftCircleFill  size={24} className="rtl:scale-x-[-1]" />
```

---

## Bug 5 — `space-x-*` utilities remain physical (not logical)  
**Severity**: low  
**Affects**: any component using `space-x-{n}` (e.g., Testimonials avatar stack with `-space-x-3`)

**Root cause**: Tailwind has no logical equivalent for `space-x-*` (it translates to `margin-left` on children). The child spacing direction does not change with `dir="rtl"`. Usually harmless because gaps are symmetrical, but `--space-x-3` (negative overlap) can produce slightly off visual stacking in RTL.

**Fix**: Replace `space-x-{n}` with `gap-{n}` on a `flex` parent wherever the physical direction matters.

---

## Bug 6 — Testimonials `tracking-widest` subtitle — letter-spacing breaks Arabic  
**Severity**: low  
**Affects**: `landing-page/src/components/Testimonials.tsx` line 247

**Root cause**: `tracking-widest` adds positive letter-spacing which is invalid / visually broken for Arabic script (Arabic letters must be joined; letter-spacing disconnects them).

**Fix**:
```tsx
<span className="text-xs font-semibold tracking-widest rtl:tracking-normal text-muted uppercase mb-4">
```

---

## Bug 7 — `uppercase` on locale code breaks Arabic display  
**Severity**: low  
**Affects**: `landing-page/src/components/LanguageSwitcher.tsx` line 93

**Root cause**: `<span className="uppercase">{currentLocale}</span>` — when `currentLocale` is `ar`, `text-transform: uppercase` has no effect on Arabic text, but if the locale code is later changed to a display name in Arabic, `uppercase` may cause issues.

**Fix**: Use `rtl:normal-case` as a guard:
```tsx
<span className="uppercase rtl:normal-case">{currentLocale}</span>
```

---

## Bug 8 — Numeric/date strings remain LTR inside RTL flow  
**Severity**: low  
**Affects**: all event cards with date strings (e.g., `"Apr 20"`, `"May 15"`)

**Root cause**: Latin date strings embedded in Arabic RTL text flow are subject to the Unicode Bidirectional Algorithm. The visual rendering is browser-dependent and may produce garbled mixed-direction text.

**Fix**: Wrap date/price strings in `<bdi>` tags or apply `dir="ltr"` to the containing `<p>` element.

---

## Out-of-scope (not introduced by this migration)

- `MobileAppPromo.tsx` — not rendered on any page; see `TODO.md` item 3.
- `front-end/` RTL layout — the platform app has no Arabic locale toggle yet; the Tailwind logical-property classes applied here are forward-compatible but RTL is not activated in the Vite app.
