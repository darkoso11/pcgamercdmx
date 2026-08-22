---
goal: Correct official social media links and synchronize contact documentation
version: 1.0
date_created: 2026-08-22
last_updated: 2026-08-22
owner: PC Gamer CDMX
status: 'In progress'
tags: [bug, social-links, documentation]
---

# Introduction

![Status: In progress](https://img.shields.io/badge/status-In%20progress-yellow)

Correct the Facebook, Instagram, and TikTok URLs exposed through the central business configuration, and keep the contact documentation consistent.

## 1. Requirements & Constraints

- **REQ-001**: Set Facebook to `https://www.facebook.com/pcgamerciudadmexico`.
- **REQ-002**: Set Instagram to `https://www.instagram.com/pcgamer_cdmx/`.
- **REQ-003**: Set TikTok to `https://www.tiktok.com/@pcgamercdmx`.
- **REQ-004**: Apply the same three values in `docs/company_contact_info.md`.
- **CON-001**: Preserve `BUSINESS_INFO.social` as the single application source of truth.
- **CON-002**: Do not modify other social networks, contact URLs, components, or styles.
- **GUD-001**: Use a failing test before changing production configuration.

## 2. Implementation Steps

### Implementation Phase 1

- GOAL-001: Establish an automated regression check for the approved URLs.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Create `src/app/shared/config/business-info.spec.ts` with exact assertions for all three approved URLs. | | |
| TASK-002 | Run the focused test and confirm it fails because the current URLs differ. | | |

### Implementation Phase 2

- GOAL-002: Apply and verify the minimal correction.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-003 | Update only the Facebook, Instagram, and TikTok properties in `src/app/shared/config/business-info.ts`. | | |
| TASK-004 | Update only the corresponding entries in `docs/company_contact_info.md`. | | |
| TASK-005 | Run the focused test, relevant test suite, production build, URL search, and `git diff --check`. | | |

## 3. Alternatives

- **ALT-001**: Edit every component link independently; rejected because components already consume the central configuration and duplication would invite drift.
- **ALT-002**: Change the URLs without a regression test; rejected because exact URL behavior can be protected cheaply.

## 4. Dependencies

- **DEP-001**: Existing Angular/Jasmine test runner configured by the repository.
- **DEP-002**: Existing `BUSINESS_INFO` imports used by navbar, home, footer, community, and SEO code.

## 5. Files

- **FILE-001**: `src/app/shared/config/business-info.spec.ts` — new regression test.
- **FILE-002**: `src/app/shared/config/business-info.ts` — central social link values.
- **FILE-003**: `docs/company_contact_info.md` — documented social link values.

## 6. Testing

- **TEST-001**: Assert exact Facebook URL equality.
- **TEST-002**: Assert exact Instagram URL equality, including trailing slash.
- **TEST-003**: Assert exact TikTok URL equality.
- **TEST-004**: Build the production application successfully.
- **TEST-005**: Search application and documentation sources to confirm obsolete profile URLs are absent from the scoped files.

## 7. Risks & Assumptions

- **RISK-001**: An external platform may redirect canonical URLs; exact approved values remain authoritative for this task.
- **ASSUMPTION-001**: All site-owned social buttons use `BUSINESS_INFO.social`, as confirmed by repository search.

## 8. Related Specifications / Further Reading

- `docs/superpowers/specs/2026-08-22-redes-sociales-design.md`
- `docs/company_contact_info.md`
