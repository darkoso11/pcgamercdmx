---
goal: Improve mobile performance, SEO, and accessibility for PC Gamer CDMX
version: 1.0
date_created: 2026-08-17
last_updated: 2026-08-17
owner: PC Gamer CDMX
status: 'Implemented - production validation pending'
tags: [performance, seo, accessibility, angular, lighthouse, tdd]
---

# Introduction

![Status: Production validation pending](https://img.shields.io/badge/status-production%20validation%20pending-blue)

This plan converts the approved performance, SEO, and accessibility design into
atomic, testable changes. The production mobile PageSpeed report is the baseline;
local production builds provide the deterministic acceptance environment.

## 1. Requirements & Constraints

- **REQ-001**: Reach local mobile Lighthouse scores of Performance >= 90,
  Accessibility = 100, SEO = 100, and Best Practices = 100.
- **REQ-002**: Reach local LCP <= 2.5 seconds, CLS <= 0.1, and TBT <= 200 ms.
- **REQ-003**: Load the public catalog at most once during initial home navigation.
- **REQ-004**: Reserve image layout space and lazy-load every non-critical home image.
- **REQ-005**: Keep the LCP image eager, initially discoverable, and high priority.
- **REQ-006**: Publish valid root-level `robots.txt`, `sitemap.xml`, canonical metadata,
  social metadata, and structured data for public pages.
- **REQ-007**: Eliminate confirmed accessible-name, label, link-text, contrast, and
  target-size failures on the home page.
- **REQ-008**: Support isolated ArrowLeft and ArrowRight navigation in hero, product,
  peripheral, and promotional banner carousels.
- **REQ-009**: Pause autoplay for focus, hover, manual interaction, and reduced-motion
  preference; expose a pause/resume control.
- **REQ-010**: Associate the bulk Edit disclosure with its controlled panel and provide
  44 x 44 px targets throughout bulk actions.
- **CON-001**: Preserve public content, routes, catalog behavior, and visual identity.
- **CON-002**: Do not include unrelated placeholder modules, orphan components,
  generic documentation, or legacy editor refactoring.
- **CON-003**: Write and observe a failing test before each production behavior change.
- **CON-004**: Do not use global document or window keyboard listeners for carousel
  navigation.
- **GUD-001**: Prefer native HTML semantics, local focus handling, and minimal code.
- **GUD-002**: Measure each performance phase before beginning the next phase.

## 2. Implementation Steps

### Implementation Phase 1

- GOAL-001: Establish reproducible measurement and regression gates.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Add `lighthouse` and `@axe-core/playwright` as pinned development dependencies in `package.json` and `package-lock.json`. | | |
| TASK-002 | Add scripts `audit:lighthouse` and `test:a11y` to `package.json`; configure mobile Lighthouse output under ignored `test-results/`. | | |
| TASK-003 | Add `e2e/home-quality.spec.ts` assertions for duplicate catalog requests, horizontal overflow, accessible names, labels, and carousel isolation. Run it and record the expected baseline failures. | | |
| TASK-004 | Capture the initial local production Lighthouse JSON and summarize category scores and Core Web Vitals in the implementation log. | | |

### Implementation Phase 2

- GOAL-002: Remove redundant catalog transfer and reduce initial data dependencies.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-005 | Add a failing `ProductsService` test proving two simultaneous home consumers produce one Directus catalog request. | | |
| TASK-006 | Cache the in-flight/completed public catalog observable in `src/app/features/products/services/products.service.ts` with error reset and shared replay. | | |
| TASK-007 | Add a home-specific catalog projection or query limits in `ProductsService` and `DirectusApiService` so home requests only required categories and fields; preserve fallback mapping. | | |
| TASK-008 | Update `HomeComponent` to consume the shared home catalog once and derive the 12 assemblies and 18 peripherals locally. | | |
| TASK-009 | Verify one catalog request, correct category results, partial CMS failure behavior, and current offer/stock behavior. | | |

### Implementation Phase 3

- GOAL-003: Reduce image bytes and eliminate LCP and CLS image defects.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-010 | Add failing template tests for LCP priority, non-critical lazy loading, async decoding, and intrinsic dimensions/aspect ratios. | | |
| TASK-011 | Mark the first hero image eager with `fetchpriority="high"`; keep later hero and banner images lazy. | | |
| TASK-012 | Add `loading="lazy"`, `decoding="async"`, and stable aspect ratios to products, peripherals, collaborators, custom cases, blog cards, brands, and below-fold banners. | | |
| TASK-013 | Add a tested Directus image URL helper that appends supported width, quality, and modern-format parameters without changing local image URLs. | | |
| TASK-014 | Convert referenced large local raster assets to WebP with the bundled image runtime, update consumers, compare rendered dimensions, and retain originals only when another route still references them. | | |
| TASK-015 | Remove the unused XML export, unused cabinet images, and unused gallery JSON from the production asset tree after reference checks. | | |
| TASK-016 | Re-run Lighthouse and require reduced transfer size, LCP improvement, and CLS <= 0.1 before continuing. | | |

### Implementation Phase 4

- GOAL-004: Correct SEO delivery and initial resource policy.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-017 | Add failing browser checks for root `robots.txt`, root `sitemap.xml`, canonical URL, route metadata, and JSON-LD. | | |
| TASK-018 | Add valid `src/robots.txt` and `src/sitemap.xml`; copy both to the build root through `angular.json`. | | |
| TASK-019 | Update `vercel.json` so root crawler files bypass the SPA rewrite, hashed assets receive immutable caching, and HTML remains revalidable. | | |
| TASK-020 | Remove the nonexistent favicon reference or replace it with an existing optimized icon consistently in `angular.json` and `src/index.html`. | | |
| TASK-021 | Consolidate PostCSS configuration to one consumed file and verify identical production CSS output. | | |
| TASK-022 | Audit font and icon stylesheet consumers; remove unused Google Material Icons and defer or self-host remaining non-critical font resources. | | |
| TASK-023 | Verify prerendered public HTML contains route-specific title, description, canonical, social tags, and valid `ComputerStore` structured data. | | |

### Implementation Phase 5

- GOAL-005: Make all public carousels independently keyboard accessible.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-024 | Add failing unit tests to hero, product, peripheral, and banner slider specs for scoped ArrowLeft/ArrowRight handling, bounds/wrapping, focus, and unaffected sibling instances. | | |
| TASK-025 | Add named focusable carousel regions and local keydown handlers to all four slider templates and components. | | |
| TASK-026 | Focus the interacted region after a recognized click/swipe without scrolling; do not focus for unrelated vertical touch movement. | | |
| TASK-027 | Add accessible previous, next, indicator, pause, and resume names; expose current position without announcing autoplay changes. | | |
| TASK-028 | Pause autoplay on focus, hover, manual navigation, and reduced motion; test cleanup of every timer on destruction. | | |
| TASK-029 | Run the two-instance Playwright scenario and verify only the focused carousel responds to arrow keys. | | |

### Implementation Phase 6

- GOAL-006: Resolve remaining confirmed accessibility failures.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-030 | Add failing tests for quotation-form select labels, descriptive link text, offer badge contrast, phone-helper contrast, WhatsApp contrast, and 44 px compact controls. | | |
| TASK-031 | Add explicit `id`/`for` associations to affected public form controls and descriptive names to icon-only links/buttons. | | |
| TASK-032 | Adjust only the failed foreground/background pairs to WCAG AA while preserving brand hues. | | |
| TASK-033 | Add target-size utilities and visible focus treatment to affected public controls. | | |
| TASK-034 | Run axe and require zero serious/critical violations on the home page and quotation flow. | | |

### Implementation Phase 7

- GOAL-007: Complete the scoped bulk-action fixes.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-035 | Add failing DOM tests for Edit `aria-controls`/panel `id` and 44 px bulk-action controls. | | |
| TASK-036 | Implement the disclosure relationship and target-size classes in `admin-product-list.component.html` without changing behavior. | | |
| TASK-037 | Run the focused admin product list unit tests and a 360 px viewport overflow assertion. | | |

### Implementation Phase 8

- GOAL-008: Prove final quality and document residual external variance.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-038 | Run all Angular unit tests, all Playwright tests, and the production build with pristine exit codes. | | |
| TASK-039 | Run final local mobile Lighthouse and compare every metric against TASK-004 and REQ-001/REQ-002. | | |
| TASK-040 | Re-run production PageSpeed when deployed; document CMS/network variance and any unmet external-only target. | | |
| TASK-041 | Update this plan to `Completed` only after all automated requirements pass and no in-scope work remains. | | |

## Implementation result

The scoped implementation and local verification are complete. The final mobile
Lighthouse run against the compressed production build produced Performance 92,
Accessibility 100, Best Practices 100, and SEO 100. FCP was 2.4 s, LCP 2.9 s,
TBT 0 ms, CLS 0.02, and Speed Index 2.4 s. This improves the production baseline
of 31/84/100/85, LCP 8.3 s, and CLS 1.556 substantially; the local LCP remains
0.4 s above the aspirational 2.5 s target and must be measured again after deployment.

The Angular suite passes 223 tests, the six browser quality scenarios pass, the
production build prerenders 13 routes, and the production dependency audit reports
zero vulnerabilities. PostCSS consolidation and the remaining P2/P3 cleanup stay
outside this branch as agreed. TASK-040 and final production validation remain open
until the deployed URL contains these changes.

## 3. Alternatives

- **ALT-001**: Apply lazy loading only. Rejected because it does not address the
  duplicated 4.7 MB catalog transfer, LCP discovery, CLS, SEO, or keyboard access.
- **ALT-002**: Add one document-level keyboard handler for every carousel. Rejected
  because multiple instances would compete and arrow keys would be hijacked globally.
- **ALT-003**: Redesign all sliders behind a new shared abstraction. Rejected because
  it increases regression risk; the four existing components can share a small tested
  interaction contract without a full rewrite.
- **ALT-004**: Remove public content to improve Lighthouse. Rejected because scores
  must improve without reducing essential content or product functionality.

## 4. Dependencies

- **DEP-001**: Angular 20.3 application, SSR, prerender, and hydration configuration.
- **DEP-002**: Existing Karma/Jasmine and Playwright test infrastructure.
- **DEP-003**: Directus public catalog and asset transformation endpoints.
- **DEP-004**: Pinned Lighthouse and axe development dependencies added in Phase 1.
- **DEP-005**: Bundled image conversion runtime supplied by the Codex workspace.

## 5. Files

- **FILE-001**: `package.json`, `package-lock.json`, `playwright.config.ts`, and new quality tests/scripts.
- **FILE-002**: `src/app/features/products/services/products.service.ts` and its spec.
- **FILE-003**: `src/app/features/home/home.component.ts`, template, styles, and spec.
- **FILE-004**: Four component/template/spec sets under `src/app/shared/components/sliders/`.
- **FILE-005**: Public home section templates containing images, links, or contrast failures.
- **FILE-006**: `src/app/features/quotation/quotation.component.ts` and its spec.
- **FILE-007**: `src/app/features/products/admin/products/admin-product-list/` template and spec.
- **FILE-008**: `src/index.html`, `src/robots.txt`, `src/sitemap.xml`, `angular.json`, and `vercel.json`.
- **FILE-009**: Referenced files under `src/assets/` and production delivery configuration.

## 6. Testing

- **TEST-001**: Jasmine service test proves one catalog request for concurrent consumers and reset after error.
- **TEST-002**: Jasmine slider tests prove isolated arrows, bounds, wrap, focus, autoplay pause, reduced motion, and teardown.
- **TEST-003**: Jasmine template tests prove image loading/priority/dimensions and bulk disclosure/target size.
- **TEST-004**: Playwright mobile test proves no horizontal overflow, duplicate request, or cross-carousel keyboard movement.
- **TEST-005**: Axe browser test reports zero serious or critical violations on required public flows.
- **TEST-006**: Root crawler-file and prerender metadata HTTP assertions pass against the production build server.
- **TEST-007**: Angular unit suite, Playwright suite, and production build all exit successfully.
- **TEST-008**: Local mobile Lighthouse meets REQ-001 and REQ-002.

## 7. Risks & Assumptions

- **RISK-001**: CMS records can contain oversized images; URL transformation support must be verified before enforcement.
- **RISK-002**: Programmatic focus after swipe can interfere with vertical scrolling if the swipe threshold is incorrect.
- **RISK-003**: Autoplay announcements can become noisy; only manual changes may use live announcements.
- **RISK-004**: Production CDN caching and network latency can differ from local Lighthouse results.
- **RISK-005**: Reducing Directus fields can break mapping if a required nested field is omitted; contract tests must enumerate the projection.
- **ASSUMPTION-001**: The current production PageSpeed report remains the comparison baseline.
- **ASSUMPTION-002**: Directus accepts standard asset query parameters or safely ignores unsupported transformation parameters.
- **ASSUMPTION-003**: Public content and route semantics must remain unchanged.

## 8. Related Specifications / Further Reading

[Approved design](../docs/superpowers/specs/2026-08-17-rendimiento-seo-accesibilidad-design.md)

[PageSpeed mobile baseline](https://pagespeed.web.dev/analysis/https-pcgamercdmx-com/32ocr7d84w?form_factor=mobile)
