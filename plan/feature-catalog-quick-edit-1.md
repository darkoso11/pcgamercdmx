---
goal: Add row-level quick editing for products and assemblies
version: 1.0
date_created: 2026-09-04
last_updated: 2026-09-04
owner: PC Gamer CDMX
status: 'Completed'
tags: [feature, admin, catalog, angular, directus]
---

# Introduction

![Status: Completed](https://img.shields.io/badge/status-Completed-brightgreen)

Implement validated row-level editing of price, stock, and publication state in the existing product and assembly administration lists while preserving all current catalog-management workflows.

## 1. Requirements & Constraints

- **REQ-001**: Render editable `price`, `stock`, and `published` controls in every product row.
- **REQ-002**: Replace the assembly management card grid with rows containing the same quick-edit controls.
- **REQ-003**: Save and discard changes independently for each catalog item.
- **REQ-004**: Send only changed fields through `ProductsAdminService.updateProduct`.
- **REQ-005**: Preserve invalid or failed drafts for correction and retry.
- **REQ-006**: Support `Enter` to save and `Escape` to discard the focused row.
- **REQ-007**: Preserve product search, filters, pagination, selection, bulk actions, and full-editor actions.
- **REQ-008**: Preserve assembly filters, creation, duplication, deletion, and full-editor actions.
- **A11Y-001**: Provide item-specific accessible labels, visible focus, native form controls, and status announcements.
- **VAL-001**: Accept finite prices greater than or equal to zero with at most two decimal places.
- **VAL-002**: Accept integer stock greater than or equal to zero.
- **CON-001**: Do not change the Directus schema or add production dependencies.
- **CON-002**: Keep `published` independent from `stock`.
- **PAT-001**: Follow test-driven development; verify every new behavior fails before implementation.
- **PAT-002**: Centralize draft comparison, validation, and patch construction in pure shared utilities.

## 2. Implementation Steps

### Implementation Phase 1

- GOAL-001: Define and verify the shared quick-edit domain behavior.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Add failing tests in `src/app/features/products/admin/shared/admin-catalog-quick-edit.utils.spec.ts` for draft creation, dirty detection, validation, patch construction, and discard semantics. | ✅ | 2026-09-04 |
| TASK-002 | Implement the minimal exported types and pure functions in `src/app/features/products/admin/shared/admin-catalog-quick-edit.utils.ts` required by TASK-001. | ✅ | 2026-09-04 |
| TASK-003 | Refactor the utility implementation after all focused tests pass without changing behavior. | ✅ | 2026-09-04 |

### Implementation Phase 2

- GOAL-002: Add row-level quick editing to the product table without regressing bulk workflows.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-004 | Add failing component tests in `admin-product-list.component.spec.ts` for initialized drafts, dirty rows, validation, successful partial saves, failed-save retention, discard, keyboard actions, and filter reapplication. | ✅ | 2026-09-04 |
| TASK-005 | Implement per-product draft state and save/discard handlers in `admin-product-list.component.ts` using `ProductsAdminService.updateProduct`. | ✅ | 2026-09-04 |
| TASK-006 | Replace static price, stock, and state cells in `admin-product-list.component.html` with accessible controls and conditional row actions while preserving existing selection and bulk-action markup. | ✅ | 2026-09-04 |

### Implementation Phase 3

- GOAL-003: Convert assembly management cards to responsive quick-edit rows.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-007 | Add failing component tests in `admin-assemblies-list.component.spec.ts` for draft lifecycle, partial saves, failure retention, discard, keyboard actions, and existing assembly actions. | ✅ | 2026-09-04 |
| TASK-008 | Implement per-assembly draft state and save/discard handlers in `admin-assemblies-list.component.ts`. | ✅ | 2026-09-04 |
| TASK-009 | Replace the management card grid in `admin-assemblies-list.component.html` with desktop table rows and mobile item layouts containing item-specific labels and status regions. | ✅ | 2026-09-04 |

### Implementation Phase 4

- GOAL-004: Verify the complete feature and make it available for local and remote review.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-010 | Run all affected unit specs and the complete Angular test suite in non-watch mode. | ✅ | 2026-09-04 |
| TASK-011 | Run the production build and resolve any template, type, or bundle regression caused by the feature. | ✅ | 2026-09-04 |
| TASK-012 | Run the Angular development server on a stable local port and verify the admin routes respond. | ✅ | 2026-09-04 |
| TASK-013 | Create a temporary Cloudflare tunnel to the development server and provide the remote URL. | ✅ | 2026-09-04 |
| TASK-014 | Update this plan status and task completion markers after verification. | ✅ | 2026-09-04 |

## 3. Alternatives

- **ALT-001**: Auto-save each cell on blur was rejected because it creates more requests and makes accidental edits harder to review.
- **ALT-002**: A unified spreadsheet-style catalog page was rejected because it duplicates existing lists and expands navigation and filtering scope.
- **ALT-003**: A side inspector was rejected because it adds clicks to frequent inventory changes.
- **ALT-004**: Adding an independent availability field was rejected because `published` already represents the approved visibility behavior.

## 4. Dependencies

- **DEP-001**: Angular 20 standalone components and template-driven forms already installed in the repository.
- **DEP-002**: `ProductsAdminService.updateProduct` for authenticated partial Directus updates and mock-mode updates.
- **DEP-003**: Existing `Product` interface fields `_id`, `price`, `stock`, and `published`.
- **DEP-004**: Existing catalog filter and sort utilities.
- **DEP-005**: Installed `cloudflared` executable for temporary remote preview.

## 5. Files

- **FILE-001**: `src/app/features/products/admin/shared/admin-catalog-quick-edit.utils.ts` — shared draft, validation, comparison, and patch logic.
- **FILE-002**: `src/app/features/products/admin/shared/admin-catalog-quick-edit.utils.spec.ts` — unit coverage for FILE-001.
- **FILE-003**: `src/app/features/products/admin/products/admin-product-list/admin-product-list.component.ts` — product row state and persistence.
- **FILE-004**: `src/app/features/products/admin/products/admin-product-list/admin-product-list.component.html` — product quick-edit controls.
- **FILE-005**: `src/app/features/products/admin/products/admin-product-list/admin-product-list.component.spec.ts` — product behavior tests.
- **FILE-006**: `src/app/features/products/admin/assemblies/admin-assemblies-list/admin-assemblies-list.component.ts` — assembly row state and persistence.
- **FILE-007**: `src/app/features/products/admin/assemblies/admin-assemblies-list/admin-assemblies-list.component.html` — responsive assembly rows.
- **FILE-008**: `src/app/features/products/admin/assemblies/admin-assemblies-list/admin-assemblies-list.component.spec.ts` — assembly behavior tests.
- **FILE-009**: `plan/feature-catalog-quick-edit-1.md` — execution record.

## 6. Testing

- **TEST-001**: Drafts copy current product values and do not mutate products before successful saves.
- **TEST-002**: Dirty detection compares price, stock, and publication independently.
- **TEST-003**: Patch construction includes only changed fields.
- **TEST-004**: Invalid price and stock values produce deterministic Spanish messages and no service call.
- **TEST-005**: Successful saves replace confirmed values with the returned server values.
- **TEST-006**: Failed saves retain the draft and expose retry and discard controls.
- **TEST-007**: Product bulk selection and bulk update tests remain green.
- **TEST-008**: Assembly create, edit, duplicate, and delete tests remain green.
- **TEST-009**: Keyboard commands affect only the row associated with the event.
- **TEST-010**: Product and assembly templates expose accessible row-specific labels and live status output.
- **TEST-011**: `npm run build` succeeds.

## 7. Risks & Assumptions

- **RISK-001**: Reapplying a publication filter may remove a just-saved row; mitigate with a confirmation message before the filtered list updates.
- **RISK-002**: Angular template-driven number inputs can temporarily emit strings or null; normalize and validate at the utility boundary.
- **RISK-003**: The current service may return `undefined` instead of throwing for some Directus failures; treat both an error notification and `undefined` as save failures.
- **RISK-004**: Replacing assembly cards may hide existing actions; explicitly preserve edit, duplicate, and delete actions in each row layout.
- **ASSUMPTION-001**: Every rendered administration item has a non-empty `_id`.
- **ASSUMPTION-002**: The Directus permissions already allow authenticated updates of `price`, `stock`, and `published`.
- **ASSUMPTION-003**: The existing `Product` mapping returns server-confirmed values after an update.

## 8. Related Specifications / Further Reading

- [Approved quick-edit design](../docs/superpowers/specs/2026-09-04-edicion-rapida-catalogo-design.md)
- [Directus integration](../docs/backend/directus-integration.md)
