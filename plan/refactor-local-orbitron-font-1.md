---
goal: Restore the Orbitron cyberpunk display typography without a render-blocking third-party stylesheet
version: 1.0
date_created: 2026-08-22
last_updated: 2026-08-22
owner: PC Gamer CDMX
status: 'Completed'
tags: [performance, typography, accessibility, angular, tdd]
---

# Introduction

![Status: Completed](https://img.shields.io/badge/status-Completed-brightgreen)

This plan restores the previously approved Orbitron display typography from a
local WOFF2 asset while preserving the current layout and mobile loading behavior.

## 1. Requirements & Constraints

- **REQ-001**: Headings and navigation that currently declare `Orbitron` must render with the real Orbitron font.
- **REQ-002**: The font must be served locally as WOFF2 with `font-display: swap`.
- **REQ-003**: The page must not load `fonts.googleapis.com` or `fonts.gstatic.com`.
- **REQ-004**: Accessibility, SEO, layout, copy, colors, and responsive behavior must remain unchanged.
- **CON-001**: Implement only on `mejora-rendimiento-SEO-carga`.
- **CON-002**: Promote only through `mejora-rendimiento-SEO-carga` to `dev`, then `test`, then `main`.
- **CON-003**: Add and observe a failing browser test before production changes.
- **GUD-001**: Do not preload the font unless measurement proves it improves the result without delaying the image LCP.

## 2. Implementation Steps

### Implementation Phase 1

- GOAL-001: Establish the typography regression test.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Add a Playwright assertion that the local Orbitron WOFF2 URL returns successfully and is used by the home display heading. | ✅ | 2026-08-22 |
| TASK-002 | Run the focused browser test and record the expected missing-font failure. | ✅ | 2026-08-22 |

### Implementation Phase 2

- GOAL-002: Restore Orbitron locally with the smallest production change.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-003 | Add the official Latin Orbitron WOFF2 asset under `src/assets/fonts/`. | ✅ | 2026-08-22 |
| TASK-004 | Add one global `@font-face` declaration in `src/styles.css` with weights 400-900 and `font-display: swap`. | ✅ | 2026-08-22 |
| TASK-005 | Verify existing component font stacks resolve to the locally loaded Orbitron face without layout edits. | ✅ | 2026-08-22 |

### Implementation Phase 3

- GOAL-003: Verify functionality, appearance, and performance.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-006 | Run the focused browser test, full Angular suite, production build, and home quality suite. | ✅ | 2026-08-22 |
| TASK-007 | Capture a mobile screenshot and verify heading and navigation typography visually. | ✅ | 2026-08-22 |
| TASK-008 | Run local mobile Lighthouse and confirm no category or LCP regression attributable to the font. | ✅ | 2026-08-22 |
| TASK-009 | Mark this plan Completed and commit implementation only after every required check passes. | ✅ | 2026-08-22 |

## 3. Alternatives

- **ALT-001**: Restore Google Fonts stylesheets. Rejected because they reintroduce third-party connection and stylesheet latency.
- **ALT-002**: Use a system-font approximation. Rejected because it does not restore the established cyberpunk identity.
- **ALT-003**: Replace Orbitron with a new display font. Rejected because this task restores the prior design rather than redesigning it.

## 4. Dependencies

- **DEP-001**: Existing Angular global stylesheet pipeline.
- **DEP-002**: Existing Playwright production-build server and home quality suite.
- **DEP-003**: Official Orbitron font distributed under its open font license.

## 5. Files

- **FILE-001**: `e2e/home-quality.spec.ts` for regression coverage.
- **FILE-002**: `src/assets/fonts/orbitron-latin.woff2` for the local font asset.
- **FILE-003**: `src/assets/fonts/OFL-Orbitron.txt` for the required font license notice.
- **FILE-004**: `src/styles.css` for the global `@font-face` declaration.
- **FILE-005**: `plan/refactor-local-orbitron-font-1.md` for execution status.

## 6. Testing

- **TEST-001**: Browser request to `/assets/fonts/orbitron-latin.woff2` returns HTTP 200 and a font content type.
- **TEST-002**: The home display heading resolves to the Orbitron family after `document.fonts.ready`.
- **TEST-003**: Initial HTML contains no Google Fonts domains.
- **TEST-004**: Angular unit tests, Playwright home quality tests, and production build complete successfully.
- **TEST-005**: Mobile Lighthouse retains Accessibility, Best Practices, and SEO at 100 with no material LCP regression.

## 7. Risks & Assumptions

- **RISK-001**: Preloading the font can compete with the image LCP; the implementation will rely on normal font discovery unless measurement proves otherwise.
- **RISK-002**: A mismatched font weight range can synthesize glyphs; the local face will expose the required 400-900 range.
- **ASSUMPTION-001**: Existing component selectors identify exactly the display text that used Orbitron before the regression.

## 8. Related Specifications / Further Reading

[Approved typography and mobile performance design](../docs/superpowers/specs/2026-08-21-tipografia-y-rendimiento-movil-design.md)

[Orbitron on Google Fonts](https://fonts.google.com/specimen/Orbitron)
