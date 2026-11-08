import type { UserRole } from '../../auth/types/auth.types';

export function adminUserRoleLabel(role: UserRole): string {
  switch (role) {
    case 'STUDENT':
      return 'Học viên';
    case 'INSTRUCTOR':
      return 'Giảng viên';
    case 'ADMIN':
      return 'Quản trị viên';
    default:
      return role;
  }
}
