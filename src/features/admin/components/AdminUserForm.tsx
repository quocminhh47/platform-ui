import { useMemo, useRef, useState, type FormEvent } from 'react';
import { FormField } from '../../auth/components/FormField';
import { fieldDescribedBy } from '../../auth/components/fieldDescribedBy';
import type { User, UserRole } from '../../auth/types/auth.types';
import { confirmDeactivateUser } from '../utils/admin-user-confirmations';
import { adminUserRoleLabel } from '../utils/adminUserRoleLabels';
import {
  validateAdminUserCreateForm,
  validateAdminUserEditForm,
  type AdminUserCreateFormValues,
  type AdminUserEditFormValues,
} from '../validation/admin-user-form.validation';

type AdminUserFormProps =
  | {
      mode: 'edit';
      user: User;
      initialValues: AdminUserEditFormValues;
      formError: string | null;
      submitting: boolean;
      disableActiveToggle?: boolean;
      onCancel: () => void;
      onSubmit: (values: AdminUserEditFormValues) => Promise<void>;
    }
  | {
      mode: 'create';
      initialValues: AdminUserCreateFormValues;
      formError: string | null;
      submitting: boolean;
      onCancel: () => void;
      onSubmit: (values: AdminUserCreateFormValues) => Promise<void>;
    };

const ROLES: UserRole[] = ['STUDENT', 'INSTRUCTOR', 'ADMIN'];

export function AdminUserForm(props: AdminUserFormProps) {
  const [values, setValues] = useState(props.initialValues);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const inFlightRef = useRef(false);

  const clientErrors = useMemo(() => {
    if (props.mode === 'create') {
      return validateAdminUserCreateForm(values as AdminUserCreateFormValues);
    }
    return validateAdminUserEditForm(values as AdminUserEditFormValues);
  }, [props.mode, values]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (props.submitting || inFlightRef.current) {
      return;
    }
    setSubmitAttempted(true);
    if (Object.keys(clientErrors).length > 0) {
      return;
    }
    if (props.mode === 'edit' && props.user.active && !(values as AdminUserEditFormValues).active) {
      if (!confirmDeactivateUser(props.user.fullName)) {
        return;
      }
    }
    inFlightRef.current = true;
    try {
      if (props.mode === 'create') {
        await props.onSubmit(values as AdminUserCreateFormValues);
      } else {
        await props.onSubmit(values as AdminUserEditFormValues);
      }
    } finally {
      inFlightRef.current = false;
    }
  }

  const heading = props.mode === 'create' ? 'Tạo người dùng mới' : 'Chỉnh sửa người dùng';

  return (
    <section className="admin-user-form-panel" aria-labelledby="admin-user-form-heading">
      <h2 id="admin-user-form-heading" className="admin-quiz-section-heading">
        {heading}
      </h2>
      {props.mode === 'edit' ? (
        <p className="muted admin-user-form-readonly-meta">
          Email: {props.user.email} · Vai trò: {adminUserRoleLabel(props.user.role)} (không thể đổi
          sau khi tạo)
        </p>
      ) : null}

      <form className="admin-inline-form admin-user-form" onSubmit={handleSubmit} noValidate>
        {props.formError ? (
          <div className="section-error" role="alert">
            <p>{props.formError}</p>
          </div>
        ) : null}

        {props.mode === 'create' ? (
          <>
            <FormField
              id="admin-user-email"
              label="Email"
              required
              error={submitAttempted ? clientErrors.email : undefined}
            >
              <input
                id="admin-user-email"
                type="email"
                autoComplete="off"
                value={(values as AdminUserCreateFormValues).email}
                disabled={props.submitting}
                onChange={(event) =>
                  setValues((current) => ({
                    ...(current as AdminUserCreateFormValues),
                    email: event.target.value,
                  }))
                }
              />
            </FormField>
            <FormField
              id="admin-user-password"
              label="Mật khẩu"
              required
              hint="Tối thiểu 8 ký tự."
              error={submitAttempted ? clientErrors.password : undefined}
            >
              <input
                id="admin-user-password"
                type="password"
                autoComplete="new-password"
                value={(values as AdminUserCreateFormValues).password}
                disabled={props.submitting}
                onChange={(event) =>
                  setValues((current) => ({
                    ...(current as AdminUserCreateFormValues),
                    password: event.target.value,
                  }))
                }
              />
            </FormField>
            <FormField id="admin-user-role" label="Vai trò" required>
              <select
                id="admin-user-role"
                value={(values as AdminUserCreateFormValues).role}
                disabled={props.submitting}
                onChange={(event) =>
                  setValues((current) => ({
                    ...(current as AdminUserCreateFormValues),
                    role: event.target.value as UserRole,
                  }))
                }
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {adminUserRoleLabel(role)}
                  </option>
                ))}
              </select>
            </FormField>
          </>
        ) : null}

        <FormField
          id="admin-user-fullname"
          label="Họ tên"
          required
          error={submitAttempted ? clientErrors.fullName : undefined}
        >
          <input
            id="admin-user-fullname"
            value={values.fullName}
            disabled={props.submitting}
            aria-invalid={Boolean(submitAttempted && clientErrors.fullName)}
            aria-describedby={fieldDescribedBy(
              'admin-user-fullname',
              submitAttempted ? clientErrors.fullName : undefined,
            )}
            onChange={(event) => setValues((current) => ({ ...current, fullName: event.target.value }))}
          />
        </FormField>
        <FormField id="admin-user-phone" label="Số điện thoại" hint="Tùy chọn.">
          <input
            id="admin-user-phone"
            value={values.phone}
            disabled={props.submitting}
            onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))}
          />
        </FormField>
        <FormField id="admin-user-dob" label="Ngày sinh" hint="Tùy chọn. Định dạng yyyy-mm-dd.">
          <input
            id="admin-user-dob"
            type="date"
            value={values.dateOfBirth}
            disabled={props.submitting}
            onChange={(event) =>
              setValues((current) => ({ ...current, dateOfBirth: event.target.value }))
            }
          />
        </FormField>
        <FormField id="admin-user-avatar" label="URL ảnh đại diện" hint="Tùy chọn.">
          <input
            id="admin-user-avatar"
            type="url"
            value={values.avatarUrl}
            disabled={props.submitting}
            onChange={(event) =>
              setValues((current) => ({ ...current, avatarUrl: event.target.value }))
            }
          />
        </FormField>

        <div className="admin-user-active-row">
          <input
            id="admin-user-active"
            type="checkbox"
            checked={values.active}
            disabled={
              props.submitting ||
              (props.mode === 'edit' && props.disableActiveToggle)
            }
            onChange={(event) =>
              setValues((current) => ({ ...current, active: event.target.checked }))
            }
          />
          <label htmlFor="admin-user-active">Tài khoản đang hoạt động</label>
        </div>
        {props.mode === 'edit' && props.disableActiveToggle ? (
          <p className="muted admin-user-form-hint">
            Không thể thay đổi trạng thái tài khoản của chính bạn tại đây.
          </p>
        ) : null}

        <div className="admin-inline-form-actions">
          <button type="submit" className="button-primary" disabled={props.submitting}>
            {props.submitting ? 'Đang lưu…' : props.mode === 'create' ? 'Tạo tài khoản' : 'Lưu thay đổi'}
          </button>
          <button type="button" className="button-secondary" disabled={props.submitting} onClick={props.onCancel}>
            Hủy
          </button>
        </div>
      </form>
    </section>
  );
}
