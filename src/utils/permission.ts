/**
 * Central permission configuration for the admin portal.
 * Extend ROLES, PERMISSIONS, and ROLE_PERMISSIONS when adding new roles or actions.
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  SEO_MANAGER: 'seo_manager',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  // Super admin — platform
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_ORGANIZATIONS: 'view_organizations',
  VIEW_JOBS: 'view_jobs',
  VIEW_CANDIDATES: 'view_candidates',
  VIEW_HOSPITAL_JOIN_REQUESTS: 'view_hospital_join_requests',
  VIEW_SETTINGS: 'view_settings',
  MANAGE_ADMINS: 'manage_admins',

  // SEO manager — content
  VIEW_SEO_PAGES: 'view_seo_pages',
  VIEW_SEO_METADATA: 'view_seo_metadata',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** CRUD-style actions for fine-grained UI controls (buttons, forms, etc.) */
export const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
} as const;

export type Action = (typeof ACTIONS)[keyof typeof ACTIONS];

/**
 * Maps each permission to the actions allowed for that resource.
 * Add create / edit / delete here when backend support is ready.
 */
export const PERMISSION_ACTIONS: Record<Permission, Action[]> = {
  [PERMISSIONS.VIEW_DASHBOARD]: [ACTIONS.VIEW],
  [PERMISSIONS.VIEW_ORGANIZATIONS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE],
  [PERMISSIONS.VIEW_JOBS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE],
  [PERMISSIONS.VIEW_CANDIDATES]: [ACTIONS.VIEW, ACTIONS.EDIT],
  [PERMISSIONS.VIEW_HOSPITAL_JOIN_REQUESTS]: [ACTIONS.VIEW, ACTIONS.EDIT],
  [PERMISSIONS.VIEW_SETTINGS]: [ACTIONS.VIEW, ACTIONS.EDIT],
  [PERMISSIONS.MANAGE_ADMINS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE],
  [PERMISSIONS.VIEW_SEO_PAGES]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE],
  [PERMISSIONS.VIEW_SEO_METADATA]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE],
};

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ORGANIZATIONS,
    PERMISSIONS.VIEW_JOBS,
    PERMISSIONS.VIEW_CANDIDATES,
    PERMISSIONS.VIEW_HOSPITAL_JOIN_REQUESTS,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.MANAGE_ADMINS,
  ],
  [ROLES.SEO_MANAGER]: [
    PERMISSIONS.VIEW_SEO_PAGES,
    PERMISSIONS.VIEW_SEO_METADATA,
  ],
};

export type SidebarSection = 'main' | 'system' | 'seo';

export interface SidebarItemConfig {
  id: string;
  name: string;
  path: string;
  permission: Permission;
  section: SidebarSection;
}

/** Sidebar items — visibility is driven by `permission`, not hard-coded roles. */
export const SIDEBAR_ITEMS: SidebarItemConfig[] = [
  { id: 'dashboard', name: 'Dashboard', path: '/', permission: PERMISSIONS.VIEW_DASHBOARD, section: 'main' },
  { id: 'organizations', name: 'Organizations', path: '/organizations', permission: PERMISSIONS.VIEW_ORGANIZATIONS, section: 'main' },
  { id: 'jobs', name: 'Jobs', path: '/jobs', permission: PERMISSIONS.VIEW_JOBS, section: 'main' },
  { id: 'candidates', name: 'Candidates', path: '/candidates', permission: PERMISSIONS.VIEW_CANDIDATES, section: 'main' },
  { id: 'hospital-join-requests', name: 'Hospital Join Requests', path: '/hospital-join-requests', permission: PERMISSIONS.VIEW_HOSPITAL_JOIN_REQUESTS, section: 'main' },
  { id: 'seo-pages', name: 'Page Content', path: '/seo/pages', permission: PERMISSIONS.VIEW_SEO_PAGES, section: 'seo' },
  { id: 'seo-metadata', name: 'Site Metadata', path: '/seo/metadata', permission: PERMISSIONS.VIEW_SEO_METADATA, section: 'seo' },
  { id: 'settings', name: 'Settings & Profile', path: '/settings', permission: PERMISSIONS.VIEW_SETTINGS, section: 'system' },
];

export interface RoutePermissionConfig {
  path: string;
  permission: Permission;
  /** Match child paths (e.g. /organizations/:id) */
  matchPrefix?: boolean;
}

export const ROUTE_PERMISSIONS: RoutePermissionConfig[] = [
  { path: '/', permission: PERMISSIONS.VIEW_DASHBOARD },
  { path: '/organizations', permission: PERMISSIONS.VIEW_ORGANIZATIONS, matchPrefix: true },
  { path: '/jobs', permission: PERMISSIONS.VIEW_JOBS, matchPrefix: true },
  { path: '/pipeline', permission: PERMISSIONS.VIEW_JOBS, matchPrefix: true },
  { path: '/candidates', permission: PERMISSIONS.VIEW_CANDIDATES, matchPrefix: true },
  { path: '/hospital-join-requests', permission: PERMISSIONS.VIEW_HOSPITAL_JOIN_REQUESTS },
  { path: '/settings', permission: PERMISSIONS.VIEW_SETTINGS },
  { path: '/entities', permission: PERMISSIONS.VIEW_SETTINGS },
  { path: '/users', permission: PERMISSIONS.VIEW_SETTINGS },
  { path: '/seo/pages', permission: PERMISSIONS.VIEW_SEO_PAGES, matchPrefix: true },
  { path: '/seo/metadata', permission: PERMISSIONS.VIEW_SEO_METADATA, matchPrefix: true },
];

export const ROUTE_LABELS: Record<string, string> = {
  'hospital-join-requests': 'Hospital Join Requests',
  organizations: 'Organizations',
  candidates: 'Candidates',
  jobs: 'Jobs',
  settings: 'Settings & Profile',
  pipeline: 'Pipeline',
  entities: 'Entities',
  users: 'Users',
  seo: 'SEO',
  pages: 'Page Content',
  metadata: 'Site Metadata',
};

const ALL_ROLES = Object.values(ROLES);

export function normalizeRole(role: string | null | undefined): Role | null {
  if (!role) return null;
  const normalized = String(role).toLowerCase().trim();
  return ALL_ROLES.includes(normalized as Role) ? (normalized as Role) : null;
}

export function getUserRole(user: { role?: string } | null | undefined): Role | null {
  return normalizeRole(user?.role);
}

export function getRolePermissions(role: Role | null | undefined): Permission[] {
  if (!role) return [];
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(
  role: Role | null | undefined,
  permission: Permission
): boolean {
  return getRolePermissions(role).includes(permission);
}

export function canPerformAction(
  role: Role | null | undefined,
  permission: Permission,
  action: Action
): boolean {
  if (!hasPermission(role, permission)) return false;
  return (PERMISSION_ACTIONS[permission] ?? []).includes(action);
}

export function getSidebarItemsForRole(role: Role | null | undefined): SidebarItemConfig[] {
  return SIDEBAR_ITEMS.filter((item) => hasPermission(role, item.permission));
}

export function getDefaultRouteForRole(role: Role | null | undefined): string {
  const items = getSidebarItemsForRole(role);
  return items[0]?.path ?? '/auth/login';
}

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

export function getRequiredPermissionForPath(pathname: string): Permission | null {
  const path = normalizePath(pathname);

  const exact = ROUTE_PERMISSIONS.find((route) => route.path === path);
  if (exact) return exact.permission;

  const prefix = ROUTE_PERMISSIONS.find(
    (route) => route.matchPrefix && path.startsWith(route.path)
  );
  return prefix?.permission ?? null;
}

export function canAccessRoute(role: Role | null | undefined, pathname: string): boolean {
  const permission = getRequiredPermissionForPath(pathname);
  if (!permission) return true;
  return hasPermission(role, permission);
}

export function getSidebarSectionLabel(section: SidebarSection): string {
  switch (section) {
    case 'seo':
      return 'SEO';
    case 'system':
      return 'System';
    default:
      return 'Main';
  }
}
