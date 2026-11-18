# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **First-time visitors in Montevideo** looking for a church: need service time, address and what to expect.
- **Unknown seekers** ("desconocidos") who want to learn more about the Christian faith or take a first step toward it.
- **Regular members** looking for ministries, reflections and doctrine.
- **Spanish-speaking readers online** who reach blog posts and the confession of faith from outside Montevideo.
- **Portuguese and English visitors**; the site has `es`, `pt` and `en` locales.

## Product Purpose

Public site of Iglesia Bautista El Ancla (Montevideo, Uruguay, founded 1997). It welcomes newcomers and states plainly what the church believes. Success: a stranger knows when and where to come, and understands the church's doctrine before arriving.

## Positioning

Welcome plus doctrinal clarity. Warm invitation sits next to an explicit confession of faith and gospel-centred teaching. Doctrine is stated openly rather than hidden behind vague "community" language.

## Operating Context

- Sunday service 11:15-12:30 at Av. Luis A. de Herrera 3101, esq. Juan Arrieta, Montevideo 11600.
- Contact: contacto@elancla.uy. Social: YouTube, Instagram, Facebook.
- Content is edited in the sibling admin app (iEkklesia) and read at build time through `@ancla/content`, with seed fallback values.
- Many visitors arrive on phones, searching for a nearby church.

## Capabilities and Constraints

- Astro with React islands, Tailwind 4, GSAP and framer-motion, served as a Node server.
- Pages: home, blog, ministries, confession of faith, doctrine timeline, 404.
- Three locales (es primary). Content and terminology must stay correct in all three.
- Design stays local to `apps/web`; there is no shared UI package with the admin app.
- Undecided: whether pt/en are fully translated or partial; the audience split between locales.

## Brand Commitments

- Name "Iglesia Bautista El Ancla" / "El Ancla" and the existing logo.
- Theme color red `#ff2e34` is kept.
- Voice: not specified beyond the existing copy; do not invent one.

## Evidence on Hand

- Real address, geo coordinates, service time and social links in `packages/content/src/site.ts`.
- Confession of faith and doctrine content in the repo.
- Hero photos in `public/images/hero/` (`hero<n>-md.webp`).
- No confirmed testimonials, attendance figures or staff photos; do not fabricate them.

## Product Principles

1. Practical visit information is never more than a glance away.
2. State doctrine plainly; clarity over persuasion.
3. Welcome seekers without assuming church vocabulary.
4. Every locale gets equal care.
5. Never invent proof such as testimonials, numbers or people.

## Accessibility & Inclusion

No product-specific standard established. Default to WCAG AA; visitors include older members and people on mobile.
