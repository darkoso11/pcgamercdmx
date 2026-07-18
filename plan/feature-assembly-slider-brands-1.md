---
goal: Correct assembly slider data, images, and editable brand logos
version: 1.0
date_created: 2026-07-16
last_updated: 2026-07-16
owner: PC Gamer CDMX
status: 'Completed'
tags: [feature, bug, angular, directus, accessibility]
---

# Introduction

![Status: Completed](https://img.shields.io/badge/status-Completed-brightgreen)

Implement the approved assembly-slider design so Home uses only backend assemblies, image failures do not inject an unrelated cabinet, and administrators can persist an accessible selection of brand logos.

## 1. Requirements & Constraints

- **REQ-001**: Initialize `HomeComponent.carruselProducts` and `filteredCarruselProducts` as empty arrays.
- **REQ-002**: Keep both Home assembly arrays empty when `ProductsService.getAssembledPCs()` emits an empty array or errors.
- **REQ-003**: Map only persisted `AssembledPC.brandLogos` into slider items; do not infer logos from component names.
- **REQ-004**: Add NVIDIA, Intel, AMD, ASUS, Corsair, and Gigabyte multi-selection controls to the active assembly editor.
- **REQ-005**: Load saved `brandLogos` in edit mode and include normalized `{ src, alt }` objects in create, update, and draft payloads.
- **REQ-006**: Do not assign `assets/img/gabinetes/BR-938686_1.png` after a catalog or slider image load error.
- **ACC-001**: Brand controls must expose visible text, native keyboard selection, visible focus, and non-color-only selected state.
- **ACC-002**: Slider logos must remain in the existing wrapping flex layout without overlap and retain readable contrast.
- **CON-001**: Preserve the current card composition and admin visual language.
- **CON-002**: Reuse the existing `brand_logos` Directus mapping and existing image assets.
- **CON-003**: Do not refactor unrelated catalog or admin code.
- **GUD-001**: Add each regression test before its production change and observe the expected failure.

## 2. Implementation Steps

### Implementation Phase 1

- GOAL-001: Establish failing regression coverage for the confirmed root causes.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Update `src/app/features/home/home.component.spec.ts` to assert empty initial/backend-error state and persisted-only brand logo mapping. | ✅ | 2026-07-16 |
| TASK-002 | Add `src/app/shared/components/sliders/products-slider/products-slider.component.spec.ts` coverage that image errors hide the failed image and never assign `BR-938686_1.png`. | ✅ | 2026-07-16 |
| TASK-003 | Extend `src/app/features/products/admin/assemblies/admin-assembly-editor/admin-assembly-editor.component.spec.ts` to assert saved logo loading, toggling, and payload serialization. | ✅ | 2026-07-16 |
| TASK-004 | Run the three focused Karma specs and record failures caused by current behavior. | ✅ | 2026-07-16 |

### Implementation Phase 2

- GOAL-002: Remove static assembly and placeholder behavior with the smallest production changes.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-005 | Remove the static `carruselProducts` objects and obsolete `HomeCarouselProduct` type from `src/app/features/home/home.component.ts`; clear state on empty response and error. | ✅ | 2026-07-16 |
| TASK-006 | Replace `getPackageBrandLogos` inference in `src/app/features/home/home.component.ts` with persisted-logo normalization only. | ✅ | 2026-07-16 |
| TASK-007 | Change image-error handling in `src/app/shared/components/sliders/products-slider/products-slider.component.ts` so the failed element is hidden and its error handler is cleared. | ✅ | 2026-07-16 |
| TASK-008 | Remove `BR-938686_1.png` fallback assignments in affected catalog/slider components where they can mask backend images; preserve logo-specific hide behavior. | ✅ | 2026-07-16 |

### Implementation Phase 3

- GOAL-003: Add accessible brand selection to the active assembly creator/editor.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-009 | Define the six immutable brand options and a `brandLogos` form control in `src/app/features/products/admin/assemblies/admin-assembly-editor/admin-assembly-editor.component.ts`. | ✅ | 2026-07-16 |
| TASK-010 | Patch normalized saved logos during `loadAssembly` and serialize normalized selected logos in `buildAssemblyPayload`. | ✅ | 2026-07-16 |
| TASK-011 | Add a responsive native-checkbox grid to `src/app/features/products/admin/assemblies/admin-assembly-editor/admin-assembly-editor.component.html` with visible labels, logo previews, focus rings, selected borders, and no absolute positioning. | ✅ | 2026-07-16 |
| TASK-012 | Confirm the existing Directus mapper tests cover `{ src, alt }` persistence; add a mapper regression only if the editor payload exposes a mapping defect. | ✅ | 2026-07-16 |

### Implementation Phase 4

- GOAL-004: Verify behavior and close the plan.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-013 | Run the focused Karma specs until green. | ✅ | 2026-07-16 |
| TASK-014 | Run `npm run build:prod` and resolve only failures introduced by this change. | ✅ | 2026-07-16 |
| TASK-015 | Run `rg -n "BR-938686_1" src/app` and verify no remaining runtime fallback can replace an assembly image. | ✅ | 2026-07-16 |
| TASK-016 | Inspect the final diff, update this plan to `Completed`, and report verification results. | ✅ | 2026-07-16 |

## 3. Alternatives

- **ALT-001**: Infer logos automatically from CPU/GPU/motherboard text. Rejected because it overrides editorial intent and caused the reported unwanted labels.
- **ALT-002**: Store only brand names and resolve image paths at render time. Rejected because the current Directus model already persists `{ src, alt }`/`{ logo, name }` objects.
- **ALT-003**: Replace failed images with a different generic cabinet. Rejected because any cabinet replacement can visually misrepresent an assembly.

## 4. Dependencies

- **DEP-001**: Angular Reactive Forms already imported by `AdminAssemblyEditorComponent`.
- **DEP-002**: Existing Directus `brand_logos` mapping in `src/app/core/services/directus-content.mapper.ts`.
- **DEP-003**: Existing assets under `src/assets/img/marcas`.
- **DEP-004**: Karma/Jasmine test runner configured by the repository.

## 5. Files

- **FILE-001**: `src/app/features/home/home.component.ts` — backend-only assemblies and persisted-only logos.
- **FILE-002**: `src/app/features/home/home.component.spec.ts` — Home regressions.
- **FILE-003**: `src/app/shared/components/sliders/products-slider/products-slider.component.ts` — neutral image failure.
- **FILE-004**: `src/app/shared/components/sliders/products-slider/products-slider.component.spec.ts` — slider regression.
- **FILE-005**: `src/app/features/products/admin/assemblies/admin-assembly-editor/admin-assembly-editor.component.ts` — brand form state and payload.
- **FILE-006**: `src/app/features/products/admin/assemblies/admin-assembly-editor/admin-assembly-editor.component.html` — accessible selector UI.
- **FILE-007**: `src/app/features/products/admin/assemblies/admin-assembly-editor/admin-assembly-editor.component.spec.ts` — editor regressions.
- **FILE-008**: Runtime components found by `rg` that currently assign `BR-938686_1.png` on image errors.

## 6. Testing

- **TEST-001**: Home starts and remains without assembly cards when the backend returns no assemblies.
- **TEST-002**: Home maps exactly the persisted brand logos and ignores recognizable component brand names.
- **TEST-003**: Product slider image failure does not assign the cabinet placeholder.
- **TEST-004**: Editor loads existing brand selections and toggles each available option.
- **TEST-005**: Published and draft editor payloads contain normalized selected `brandLogos`.
- **TEST-006**: Production Angular build succeeds.

## 7. Risks & Assumptions

- **RISK-001**: Some existing demo products in `ProductsService` use `BR-938686_1.png` as actual product data rather than a fallback; removal must distinguish demo inventory from error substitution.
- **RISK-002**: Hiding a failed main image leaves the card media background visible; this is intentional to avoid showing the wrong cabinet.
- **ASSUMPTION-001**: The nested assembly editor referenced by `app.routes.ts` is the only active creator/editor that must change.
- **ASSUMPTION-002**: Directus accepts the existing `brand_logos` JSON array without schema changes.
- **ASSUMPTION-003**: The six selected logo assets are `nvidia_tag.svg`, `intel_tag.svg`, `ryzen_tag.svg`, `asuspng.png`, `corsairbrand.png`, and `gigabyte.png`.

## 8. Related Specifications / Further Reading

- `docs/superpowers/specs/2026-07-16-slider-ensambles-design.md`
- `src/app/core/services/directus-content.mapper.ts`
