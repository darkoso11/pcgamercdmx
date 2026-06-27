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

    expect(paths.some((path) => path === 'admin' || path.startsWith('admin/'))).toBeFalse();
    expect(paths).not.toContain(`${ADMIN_BASE_PATH}/blog/login`);
  });

  it('redirects legacy package admin routes to the active assembly CRUD', () => {
    const packagesRoute = routes.find((route) => route.path === `${ADMIN_BASE_PATH}/products/packages`);
    const newPackageRoute = routes.find((route) => route.path === `${ADMIN_BASE_PATH}/products/packages/new`);
    const editPackageRoute = routes.find((route) => route.path === `${ADMIN_BASE_PATH}/products/packages/:id/edit`);

    expect(packagesRoute?.redirectTo).toBe(`${ADMIN_BASE_PATH}/products/assemblies`);
    expect(newPackageRoute?.redirectTo).toBe(`${ADMIN_BASE_PATH}/products/assemblies/new`);
    expect(editPackageRoute?.redirectTo).toBe(`${ADMIN_BASE_PATH}/products/assemblies/:id/edit`);
  });
});
