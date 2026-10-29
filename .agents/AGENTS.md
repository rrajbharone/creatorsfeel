# Workspace Rules for creatorsfeel.com

1. Mobile-first development is mandatory.
2. Every page must be fully responsive from 320px to 1920px (test 320px, 360px, 375px, 390px, 430px, tablet, and desktop with zero horizontal scrolling).
3. Mobile responsiveness is the highest priority.
4. Website speed, PageSpeed, and Core Web Vitals are top priorities from the beginning of development:
   - Build fast by design: make speed a core requirement from line one, not an afterthought.
   - Keep Astro implementations lightweight: avoid unnecessary JavaScript, heavy dependencies, large runtime libraries, and render-blocking resources.
   - Optimize FCP and LCP from the start: render above-the-fold content instantly and prioritize the actual LCP element (proper sizing, modern formats, preloads, sync decode, high fetchpriority).
   - Optimize images, fonts, CSS, and JavaScript: use modern formats (AVIF/WebP), responsive image sizes (`srcset`), lazy-load below-the-fold assets, and avoid external font `@import` chains.
   - Use Astro static rendering and code splitting. Load tool-specific client scripts only when needed.
   - Prevent layout shifts (CLS = 0): always provide explicit aspect ratios, dimensions, and reserve layout slots.
   - Avoid heavy CPU tasks, long main-thread animations, and unoptimized third-party scripts.
   - Target mobile Lighthouse Performance 90+ and FCP/LCP near 1.5s where realistically achievable.
   - Check for performance regressions whenever modifying shared layouts, global CSS, fonts, or shared scripts.
   - Before completing any tool, report the main performance optimizations made and any remaining bottlenecks.
5. SEO is the highest priority after performance.
6. Never use placeholder code or TODO comments.
7. Never redesign completed sections unless explicitly requested.
8. Use Astro best practices and generate static pages whenever possible.
9. Use reusable components and keep JavaScript minimal.
10. Follow the existing CreatorsFeel.com design system, preserve light/dark themes, and use professional inline SVG icons only (never use emojis).
11. Keep all calculator and tool functionality accurate, responsive, and fully working. Do not sacrifice usability, accessibility, SEO, or design for speed.
12. Always deliver production-ready code.
13. Test every page for desktop, tablet, and mobile before marking it complete, and verify `npm run build` succeeds cleanly.
