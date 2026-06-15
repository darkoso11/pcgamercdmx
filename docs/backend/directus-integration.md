# Directus backend

PCGamerCDMX uses Directus as a temporary backend/CMS before moving custom business logic to Django + PostgreSQL.

## Runtime

- Backend type: Directus CMS
- Active URL: configured in Angular environment files.
- Database: PostgreSQL 16
- Cache: Redis 7
- Credentials: use local environment variables or a private, untracked credentials file.

Move to the production CMS/API domain after DNS and TLS are configured.

## Collections

- `pc_categories`: editable category tree for the catalog.
- `pc_subcategories`: editable subcategory tree for catalog/blog admin forms.
- `pc_products`: product and assembled PC content.
- `pc_blog_posts`: blog/SEO posts.
- `pc_quote_requests`: contact and quotation submissions from Angular.

Public access is intentionally narrow:

- Public read is enabled only for `published = true` items in `pc_categories`, `pc_products`, and `pc_blog_posts`.
- Public create is enabled only for `pc_quote_requests`.
- Product/blog/catalog writes can happen from the Angular admin after Directus login. This is a temporary CMS-admin flow; keep the app free of any hardcoded tokens or passwords.

## Angular integration

Development and production Angular builds point to `https://cms.test.pcgamercdmx.com`.

Enabled now:

- Admin login uses Directus `/auth/login` and stores the session token in browser storage.
- Admin blog articles/categories use Directus CRUD.
- Admin product list/editor/category manager use Directus CRUD.
- Blog list/detail reads from Directus, with mock JSON fallback.
- Catalog/product pages read `pc_products` from Directus, with hardcoded Angular catalog fallback.
- Contact and quotation forms submit to `pc_quote_requests`, while still opening WhatsApp.

Current seeded content:

- 3 categories.
- 12 subcategories.
- 13 public products in Directus, including the migrated Angular mock catalog and the previous seed product.
- 2 blog posts after adding the mock blog sample.

The migration/verification scripts are:

- `node tools/directus-seed-from-mocks.mjs`
- `node tools/verify-directus-local.mjs`

Both scripts read Directus credentials from environment variables or the local credentials file. Do not commit secrets.

Security note: browser storage tokens are acceptable only for this temporary admin CMS workflow. Before moving to the Django backend, switch to a backend-owned session strategy with CSRF/session hardening or short-lived token refresh through the server.

## Django migration path

Keep the collection names and field shapes close to the future Django models:

- `Product`
- `Category`
- `BlogPost`
- `QuoteRequest`

When Django is introduced, point Angular's backend URL to the Django API and keep the public DTOs compatible. Directus can then become either an internal CMS feeding Django or be retired after data migration into Django-managed PostgreSQL tables.
