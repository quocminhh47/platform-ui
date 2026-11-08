import type { UserRole } from '../../auth/types/auth.types';

export type AdminUserEditFormValues = {
  fullName: string;
  phone: string;
  dateOfBirth: string;
  avatarUrl: string;
  active: boolean;
};

export type AdminUserCreateFormValues = AdminUserEditFormValues & {
  email: string;
  password: string;
  role: UserRole;
};

export type AdminUserFormErrors = Partial<
  Record<
    keyof AdminUserCreateFormValues,
    string
  >
>;

const FULL_NAME_MAX = 255;
const PASSWORD_MIN = 8;

export function validateAdminUserEditForm(values: AdminUserEditFormValues): AdminUserFormErrors {
  const errors: AdminUserFormErrors = {};
  const fullName = values.fullName.trim();
  if (!fullName) {
    errors.fullName = 'Vui lòng nhập họ tên.';
  } else if (fullName.length > FULL_NAME_MAX) {
    errors.fullName = `Họ tên tối đa ${FULL_NAME_MAX} ký tự.`;
  }
  return errors;
}

export function validateAdminUserCreateForm(values: AdminUserCreateFormValues): AdminUserFormErrors {
  const errors = validateAdminUserEditForm(values);
  const email = values.email.trim();
  if (!email) {
    errors.email = 'Vui lòng nhập email.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Email không hợp lệ.';
  }
  if (!values.password) {
    errors.password = 'Vui lòng nhập mật khẩu.';
  } else if (values.password.length < PASSWORD_MIN) {
    errors.password = `Mật khẩu tối thiểu ${PASSWORD_MIN} ký tự.`;
  }
  return errors;
}

export function userToEditFormValues(user: {
  fullName: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  avatarUrl?: string | null;
  active: boolean;
}): AdminUserEditFormValues {
  return {
    fullName: user.fullName,
    phone: user.phone ?? '',
    dateOfBirth: user.dateOfBirth ?? '',
    avatarUrl: user.avatarUrl ?? '',
    active: user.active,
  };
}

export function emptyAdminUserCreateFormValues(): AdminUserCreateFormValues {
  return {
    email: '',
    password: '',
    fullName: '',
    role: 'STUDENT',
    phone: '',
    dateOfBirth: '',
    avatarUrl: '',
    active: true,
  };
}
