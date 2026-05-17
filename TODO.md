# TODO — Ormeet Monorepo

## 1. Migrate `middleware.ts` → `proxy.ts` (Next.js 16)

`landing-page/src/middleware.ts` uses the legacy middleware API for locale detection.
When `next-intl` fully supports Next.js 16's new `proxy.ts` handler, migrate locale
routing there to remove the deprecation warning.

Reference: https://next-intl-docs.vercel.app/docs/routing/middleware

---

## 2. Sync event categories with the backend API

Event categories are currently hard-coded in `packages/i18n/src/messages/*/landing.json`
(`categories.*` keys used in `DiscoverSection.tsx` and `FindYourVibe.tsx`).
Replace with a live fetch from the backend `/categories` endpoint so that
category additions on the server side are automatically reflected in the UI.

---

## 3. Translate `MobileAppPromo.tsx` when activated

`landing-page/src/components/MobileAppPromo.tsx` is currently not rendered in any page.
When it is activated, add translation keys to `packages/i18n/src/messages/*/landing.json`
under a `mobileAppPromo` namespace and wire up `useTranslations('landing.mobileAppPromo')`
inside the component.
