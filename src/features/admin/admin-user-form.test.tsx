import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { User } from '../auth/types/auth.types';
import { AdminUserForm } from './components/AdminUserForm';
import {
  emptyAdminUserCreateFormValues,
  userToEditFormValues,
} from './validation/admin-user-form.validation';

function activeStudent(overrides: Partial<User> = {}): User {
  return {
    id: 'u-student',
    email: 'student@example.com',
    fullName: 'Nguyen Van A',
    role: 'STUDENT',
    avatarUrl: null,
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function renderEditForm(user: User, options?: { disableActiveToggle?: boolean }) {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  render(
    <AdminUserForm
      mode="edit"
      user={user}
      initialValues={userToEditFormValues(user)}
      formError={null}
      submitting={false}
      disableActiveToggle={options?.disableActiveToggle}
      onCancel={vi.fn()}
      onSubmit={onSubmit}
    />,
  );
  return { onSubmit, user };
}

describe('AdminUserForm edit deactivation confirmation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requires confirmation when deactivating an active user', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { onSubmit } = renderEditForm(activeStudent());

    fireEvent.click(screen.getByLabelText('Tài khoản đang hoạt động'));
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(confirmSpy.mock.calls[0]?.[0]).toContain('Nguyen Van A');
    expect(onSubmit.mock.calls[0]?.[0].active).toBe(false);
  });

  it('does not call onSubmit when deactivation confirmation is canceled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { onSubmit } = renderEditForm(activeStudent());

    fireEvent.click(screen.getByLabelText('Tài khoản đang hoạt động'));
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    await waitFor(() => expect(window.confirm).toHaveBeenCalled());
    expect(onSubmit).not.toHaveBeenCalled();
    expect((screen.getByLabelText('Tài khoản đang hoạt động') as HTMLInputElement).checked).toBe(
      false,
    );
    expect((screen.getByLabelText(/^Họ tên/) as HTMLInputElement).value).toBe('Nguyen Van A');
  });

  it('does not require confirmation when inactive user stays inactive', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = activeStudent({ active: false });
    const { onSubmit } = renderEditForm(user);

    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('does not require confirmation when activating an inactive user', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = activeStudent({ active: false });
    const { onSubmit } = renderEditForm(user);

    fireEvent.click(screen.getByLabelText('Tài khoản đang hoạt động'));
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(onSubmit.mock.calls[0]?.[0].active).toBe(true);
  });

  it('does not require confirmation when saving an active user without deactivating', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { onSubmit } = renderEditForm(activeStudent());

    fireEvent.change(screen.getByLabelText(/^Họ tên/), { target: { value: 'Updated Name' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('prevents toggling active off for the current admin via disableActiveToggle', () => {
    const admin = activeStudent({ id: 'u-admin', role: 'ADMIN', fullName: 'Admin User' });
    renderEditForm(admin, { disableActiveToggle: true });

    const activeCheckbox = screen.getByLabelText('Tài khoản đang hoạt động') as HTMLInputElement;
    expect(activeCheckbox.disabled).toBe(true);
    expect(
      screen.getByText(/Không thể thay đổi trạng thái tài khoản của chính bạn/),
    ).toBeTruthy();
  });

  it('performs exactly one submit after confirm despite duplicate clicks', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    let resolveSubmit!: () => void;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
    );
    const user = activeStudent();
    render(
      <AdminUserForm
        mode="edit"
        user={user}
        initialValues={userToEditFormValues(user)}
        formError={null}
        submitting={false}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByLabelText('Tài khoản đang hoạt động'));
    const save = screen.getByRole('button', { name: 'Lưu thay đổi' });
    fireEvent.click(save);
    fireEvent.click(save);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    resolveSubmit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(window.confirm).toHaveBeenCalledTimes(1);
  });
});

describe('AdminUserForm create', () => {
  it('does not show deactivation confirmation on create', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <AdminUserForm
        mode="create"
        initialValues={{ ...emptyAdminUserCreateFormValues(), active: false }}
        formError={null}
        submitting={false}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText(/^Email/), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Mật khẩu/), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/^Họ tên/), { target: { value: 'New User' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(confirmSpy).not.toHaveBeenCalled();
  });
});
