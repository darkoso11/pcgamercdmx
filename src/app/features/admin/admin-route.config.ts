export const ADMIN_BASE_PATH = 'control-pcg-cdmx-2026';
export const ADMIN_BASE_URL = `/${ADMIN_BASE_PATH}`;

export function adminRoute(path = ''): string {
  const childPath = path.replace(/^\/+/, '');
  return childPath ? `${ADMIN_BASE_PATH}/${childPath}` : ADMIN_BASE_PATH;
}

export function adminUrl(path = ''): string {
  return `/${adminRoute(path)}`;
}

export function isAdminUrl(url: string): boolean {
  const path = url.split(/[?#]/)[0] || '/';
  return path === ADMIN_BASE_URL || path.startsWith(`${ADMIN_BASE_URL}/`);
}
