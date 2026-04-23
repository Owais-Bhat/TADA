export const ADMIN_ROLES = [
  "Manager",
  "HR",
  "Finance",
  "SuperAdmin",
] as const;

export const EMPLOYEE_MANAGEMENT_ROLES = [
  "HR",
  "Finance",
  "SuperAdmin",
] as const;

export function isAdminRole(role: string) {
  return ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]);
}

export function canManageEmployees(role: string) {
  return EMPLOYEE_MANAGEMENT_ROLES.includes(
    role as (typeof EMPLOYEE_MANAGEMENT_ROLES)[number],
  );
}

export function getRoleHome(role: string) {
  return isAdminRole(role) ? "/admin/overview" : "/dashboard";
}
