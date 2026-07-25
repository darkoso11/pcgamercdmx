import { routes } from './app.routes';
import { ADMIN_BASE_PATH } from './features/admin/admin-route.config';

function flattenRoutePaths(items: typeof routes = routes, prefix = ''): string[] {
  return items.flatMap((route) => {
    const routePath = route.path ?? '';
    const fullPath = [prefix, routePath].filter(Boolean).join('/');
    const childPaths = route.children ? flattenRoutePaths(route.children, fullPath) : [];
    return [fullPath, ...childPaths];
  });
}

describe('admin routes', () => {
  it('uses the private admin base path and keeps legacy admin URLs unavailable', () => {
    const paths = flattenRoutePaths();

    expect(paths).toContain(ADMIN_BASE_PATH);
    expect(paths).toContain(`${ADMIN_BASE_PATH}/login`);
    expect(paths).toContain(`${ADMIN_BASE_PATH}/products`);
    expect(paths).toContain(`${ADMIN_BASE_PATH}/assemblies`);
    expect(paths).toContain(`${ADMIN_BASE_PATH}/assemblies/list`);
    expect(paths).toContain(`${ADMIN_BASE_PATH}/assemblies/new`);
    expect(paths).toContain(`${ADMIN_BASE_PATH}/assemblies/:id/edit`);
    expect(paths).toContain(`${ADMIN_BASE_PATH}/assemblies/categories`);
    expect(paths).toContain(`${ADMIN_BASE_PATH}/assemblies/offers`);

    expect(paths.some((path) => path === 'admin' || path.startsWith('admin/'))).toBeFalse();
    expect(paths).not.toContain(`${ADMIN_BASE_PATH}/blog/login`);
  });

  it('redirects legacy product-nested assembly routes to the canonical assembly CRUD', () => {
    const assembliesRoute = routes.find((route) => route.path === `${ADMIN_BASE_PATH}/products/assemblies`);
    const newAssemblyRoute = routes.find((route) => route.path === `${ADMIN_BASE_PATH}/products/assemblies/new`);
    const editAssemblyRoute = routes.find((route) => route.path === `${ADMIN_BASE_PATH}/products/assemblies/:id/edit`);
    const packagesRoute = routes.find((route) => route.path === `${ADMIN_BASE_PATH}/products/packages`);
    const newPackageRoute = routes.find((route) => route.path === `${ADMIN_BASE_PATH}/products/packages/new`);
    const editPackageRoute = routes.find((route) => route.path === `${ADMIN_BASE_PATH}/products/packages/:id/edit`);

    expect(assembliesRoute?.redirectTo).toBe(`${ADMIN_BASE_PATH}/assemblies/list`);
    expect(newAssemblyRoute?.redirectTo).toBe(`${ADMIN_BASE_PATH}/assemblies/new`);
    expect(editAssemblyRoute?.redirectTo).toBe(`${ADMIN_BASE_PATH}/assemblies/:id/edit`);
    expect(packagesRoute?.redirectTo).toBe(`${ADMIN_BASE_PATH}/assemblies/list`);
    expect(newPackageRoute?.redirectTo).toBe(`${ADMIN_BASE_PATH}/assemblies/new`);
    expect(editPackageRoute?.redirectTo).toBe(`${ADMIN_BASE_PATH}/assemblies/:id/edit`);
  });

  it('declares an explicit catalog domain for category and offer tools', () => {
    const productCategories = routes.find((route) => route.path === `${ADMIN_BASE_PATH}/products/categories`);
    const productOffers = routes.find((route) => route.path === `${ADMIN_BASE_PATH}/products/offers`);
    const assemblyCategories = routes.find((route) => route.path === `${ADMIN_BASE_PATH}/assemblies/categories`);
    const assemblyOffers = routes.find((route) => route.path === `${ADMIN_BASE_PATH}/assemblies/offers`);

    expect(productCategories?.data?.['catalogDomain']).toBe('products');
    expect(productOffers?.data?.['catalogDomain']).toBe('products');
    expect(assemblyCategories?.data?.['catalogDomain']).toBe('assemblies');
    expect(assemblyOffers?.data?.['catalogDomain']).toBe('assemblies');
  });
});
