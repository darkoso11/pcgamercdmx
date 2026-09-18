---
goal: Add inline quick editing and in-panel filters to both catalog dashboards
version: 1.0
date_created: 2026-09-05
last_updated: 2026-09-05
owner: PC Gamer CDMX
status: 'Completed'
tags: [feature, admin, catalog, angular, tdd]
---

# Introduction

![Status: Completed](https://img.shields.io/badge/status-Completed-brightgreen)

Implement the approved dashboard catalog workflow so Admin Productos and Admin Ensambles open with 20 recent items and retain row-level quick editing across every local filter.

## 1. Requirements & Constraints

- **REQ-001**: Admin Productos must initially render at most 20 products ordered by creation date descending.
- **REQ-002**: Admin Ensambles must initially render at most 20 assemblies ordered by creation date descending.
- **REQ-003**: Each dashboard must expose recent, all, published, draft, low-stock, and out-of-stock views without router navigation.
- **REQ-004**: Non-recent views must paginate locally at 20 rows per page.
- **REQ-005**: Every visible row must edit `price`, `stock`, and `published` and expose detailed edit, duplicate, and delete actions.
- **REQ-006**: Draft filtering must remain `published === false`; no publication-history field may be added.
- **REQ-007**: The existing full-list routes and product bulk editing must remain functional.
- **CON-001**: Reuse `admin-catalog-quick-edit.utils.ts` validation and partial-patch behavior.
- **CON-002**: Persist changes through `ProductsAdminService.updateProduct` without changing Directus schema.
- **CON-003**: Preserve the existing admin visual language and provide a mobile layout without mandatory horizontal scrolling.
- **GUD-001**: Follow red-green-refactor for each behavior change.

## 2. Implementation Steps

### Implementation Phase 1

- GOAL-001: Define deterministic recent ordering and dashboard view derivation.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Add failing tests in `src/app/features/products/admin/shared/admin-catalog-flow.utils.spec.ts` for creation-date ordering, six dashboard views, and 20-item pagination. | ✅ | 2026-09-05 |
| TASK-002 | Add minimal pure helpers and dashboard-view types to `src/app/features/products/admin/shared/admin-catalog-flow.utils.ts`; verify focused tests pass. | ✅ | 2026-09-05 |

### Implementation Phase 2

- GOAL-002: Add quick-edit behavior to both dashboards.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-003 | Add failing product-dashboard tests for 20-item loading, local filter changes, pagination reset, row drafts, partial save, discard, retry state, duplicate, delete, and detailed edit. | ✅ | 2026-09-05 |
| TASK-004 | Implement the minimum product-dashboard state and handlers in `admin-products-dashboard.component.ts` to pass TASK-003. | ✅ | 2026-09-05 |
| TASK-005 | Add equivalent failing tests to `admin-assemblies-dashboard.component.spec.ts`. | ✅ | 2026-09-05 |
| TASK-006 | Implement the minimum assembly-dashboard state and handlers in `admin-assemblies-dashboard.component.ts` to pass TASK-005. | ✅ | 2026-09-05 |

### Implementation Phase 3

- GOAL-003: Render the approved desktop and mobile editor rows.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-007 | Add failing template assertions for editable price, stock, publication, save/discard, detailed edit, duplicate, delete, view controls, and pagination on both dashboards. | ✅ | 2026-09-05 |
| TASK-008 | Replace the product recent read-only table in `admin-products-dashboard.component.html` with the responsive quick-edit results section. | ✅ | 2026-09-05 |
| TASK-009 | Replace the assembly recent card grid in `admin-assemblies-dashboard.component.html` with the same responsive quick-edit pattern. | ✅ | 2026-09-05 |

### Implementation Phase 4

- GOAL-004: Verify regression safety and the running application.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-010 | Run focused dashboard, utility, service, and full-list tests. | ✅ | 2026-09-05 |
| TASK-011 | Run the complete unit test suite and production build. | ✅ | 2026-09-05 |
| TASK-012 | Inspect Admin Productos and Admin Ensambles through the running app at desktop and mobile widths; verify the tunnel still reaches the app. | ✅ | 2026-09-05 |

## 3. Alternatives

- **ALT-001**: Embed the complete list components inside each dashboard. Rejected because it would duplicate page headers, advanced filters, and bulk controls that are outside the dashboard scope.
- **ALT-002**: Navigate metric cards to the full-list routes. Rejected because the approved requirement is filtering without leaving the dashboard.
- **ALT-003**: Add publication history to distinguish hidden items from new drafts. Rejected because the user explicitly approved the existing boolean model.

## 4. Dependencies

- **DEP-001**: Angular standalone components, template-driven forms, RxJS, and Router already used by the admin feature.
- **DEP-002**: `ProductsAdminService` update, duplicate, and delete operations.
- **DEP-003**: Existing quick-edit draft utilities and catalog-domain filtering utilities.

## 5. Files

- **FILE-001**: `src/app/features/products/admin/shared/admin-catalog-flow.utils.ts` — view filtering, recent ordering, and pagination helpers.
- **FILE-002**: `src/app/features/products/admin/shared/admin-catalog-flow.utils.spec.ts` — pure helper tests.
- **FILE-003**: `src/app/features/products/admin/dashboard/admin-products-dashboard/admin-products-dashboard.component.ts` — product dashboard state and actions.
- **FILE-004**: `src/app/features/products/admin/dashboard/admin-products-dashboard/admin-products-dashboard.component.html` — product editor rows.
- **FILE-005**: `src/app/features/products/admin/dashboard/admin-products-dashboard/admin-products-dashboard.component.spec.ts` — product dashboard tests.
- **FILE-006**: `src/app/features/products/admin/dashboard/admin-assemblies-dashboard/admin-assemblies-dashboard.component.ts` — assembly dashboard state and actions.
- **FILE-007**: `src/app/features/products/admin/dashboard/admin-assemblies-dashboard/admin-assemblies-dashboard.component.html` — assembly editor rows.
- **FILE-008**: `src/app/features/products/admin/dashboard/admin-assemblies-dashboard/admin-assemblies-dashboard.component.spec.ts` — assembly dashboard tests.

## 6. Testing

- **TEST-001**: Focused pure-helper tests must fail before helper implementation and pass afterward.
- **TEST-002**: Each dashboard behavior test must fail because the new state or handler is absent before its implementation.
- **TEST-003**: Existing quick-edit list tests must remain green.
- **TEST-004**: Full unit suite must complete with zero failures.
- **TEST-005**: Production build must complete successfully.
- **TEST-006**: Manual browser checks must confirm filters stay in-panel and every visible view retains quick editing.

## 7. Risks & Assumptions

- **RISK-001**: `createdAt` may be absent in legacy data; the helper must use stable fallback ordering.
- **RISK-002**: Updating publication or stock can remove a row from the active view; removal must occur only after server confirmation.
- **RISK-003**: Two dashboard implementations can drift; both must use the same pure helpers and draft utilities.
- **ASSUMPTION-001**: `getAllProducts()` returns the full administrative catalog required for local filters and pagination.
- **ASSUMPTION-002**: The existing destructive-action confirmation behavior remains the source of truth for deletion.

## 8. Related Specifications / Further Reading

- `docs/superpowers/specs/2026-09-05-edicion-rapida-paneles-catalogo-design.md`
- `docs/superpowers/specs/2026-09-04-edicion-rapida-catalogo-design.md`
