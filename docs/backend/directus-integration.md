# Directus backend

PCGamerCDMX uses Directus as a temporary backend/CMS before moving custom business logic to Django + PostgreSQL.

## Runtime

- Dokploy service: `Directus Backend`
- Compose ID: `SJseShawHt9GwldxF1BpH`
- Active URL: `https://cms.test.pcgamercdmx.com`
- Database: PostgreSQL 16
- Cache: Redis 7
- Credentials: stored locally at `C:\Users\lince\.pcgamercdmx\directus-backend.txt`

`cms.test.pcgamercdmx.com` is currently used because it already resolves to the Dokploy server and has a valid Let's Encrypt certificate. Move to `cms.pcgamercdmx.com` or `api.pcgamercdmx.com` after creating the DNS A record to `129.121.62.218`.

## Collections

- `pc_categories`: editable category tree for the catalog.
- `pc_products`: product and assembled PC content.
- `pc_blog_posts`: blog/SEO posts.
- `pc_quote_requests`: contact and quotation submissions from Angular.

Public access is intentionally narrow:

- Public read is enabled only for `published = true` items in `pc_categories`, `pc_products`, and `pc_blog_posts`.
- Public create is enabled only for `pc_quote_requests`.
- Product/blog writes should happen in Directus Admin, not from Angular with an admin token.

## Angular integration

Production Angular builds point to `https://cms.test.pcgamercdmx.com`.

Enabled now:

- Blog list/detail reads from Directus, with mock JSON fallback.
- Contact and quotation forms submit to `pc_quote_requests`, while still opening WhatsApp.

Catalog reads remain disabled in `environment.prod.ts` until real product content is migrated from the current hardcoded Angular catalog:

```ts
directus: {
  features: {
    catalog: false
  }
}
```

## Django migration path

Keep the collection names and field shapes close to the future Django models:

- `Product`
- `Category`
- `BlogPost`
- `QuoteRequest`

When Django is introduced, point Angular's backend URL to the Django API and keep the public DTOs compatible. Directus can then become either an internal CMS feeding Django or be retired after data migration into Django-managed PostgreSQL tables.
