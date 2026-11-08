import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../app/providers/AuthProvider';
import { ToastProvider } from '../../components/feedback/ToastProvider';
import { ApiError } from '../../services/api/api-error';
import { setAccessToken } from '../../services/api/token-storage';
import * as authApi from '../auth/api/auth.api';
import { ProtectedRoute } from '../auth/components/ProtectedRoute';
import type { User } from '../auth/types/auth.types';
import { mockPage } from '../../testing/mockPageResponse';
import * as adminMetricsApi from './api/admin-metrics.api';
import * as adminUsersApi from './api/admin-users.api';
import { AdminRoute } from './components/AdminRoute';
import { AdminUserListPage } from './pages/AdminUserListPage';

vi.mock('../auth/api/auth.api', () => ({
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('./api/admin-users.api', () => ({
  listUsersPage: vi.fn(),
  getUserById: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock('./api/admin-metrics.api', () => ({
  fetchUserMetrics: vi.fn(),
}));

const auth = vi.mocked(authApi);
const usersApi = vi.mocked(adminUsersApi);
const metricsApi = vi.mocked(adminMetricsApi);

const admin: User = {
  id: 'u-admin',
  email: 'admin@example.com',
  fullName: 'Admin User',
  role: 'ADMIN',
  avatarUrl: null,
  active: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function sampleUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u-student',
    email: 'student@example.com',
    fullName: 'Nguyen Van A',
    role: 'STUDENT',
    avatarUrl: null,
    active: true,
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
    ...overrides,
  };
}

function renderUsers() {
  const router = createMemoryRouter(
    [
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AdminRoute />,
            children: [{ path: '/admin/users', element: <AdminUserListPage /> }],
          },
        ],
      },
    ],
    { initialEntries: ['/admin/users'] },
  );

  render(
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>,
  );
}

beforeEach(() => {
  sessionStorage.clear();
  auth.fetchCurrentUser.mockReset();
  usersApi.listUsersPage.mockReset();
  usersApi.createUser.mockReset();
  usersApi.updateUser.mockReset();
  metricsApi.fetchUserMetrics.mockReset();
  metricsApi.fetchUserMetrics.mockResolvedValue({ total: 2, active: 1, inactive: 1 });
  setAccessToken('admin-token');
  auth.fetchCurrentUser.mockResolvedValue(admin);
});

describe('AdminUserListPage', () => {
  it('loads and displays users with role and status', async () => {
    usersApi.listUsersPage.mockResolvedValue(
      mockPage([
        sampleUser(),
        sampleUser({
          id: 'u-inst',
          fullName: 'Teacher B',
          email: 'teacher@example.com',
          role: 'INSTRUCTOR',
          active: false,
        }),
      ]),
    );

    renderUsers();

    expect(await screen.findByText('Nguyen Van A')).toBeTruthy();
    expect(screen.getByText('student@example.com')).toBeTruthy();
    expect(screen.getAllByText('Học viên').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Giảng viên').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Đang hoạt động').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ngưng hoạt động').length).toBeGreaterThan(0);
    expect(usersApi.listUsersPage).toHaveBeenCalled();
  });

  it('filters users by search and role', async () => {
    const all = [
      sampleUser(),
      sampleUser({ id: 'u2', fullName: 'Beta User', email: 'beta@example.com', role: 'ADMIN' }),
    ];
    usersApi.listUsersPage.mockImplementation(async (_token, params) => {
      let rows = all;
      const q = params?.q?.toLowerCase() ?? '';
      if (q.includes('beta')) {
        rows = all.filter((u) => u.fullName.toLowerCase().includes('beta'));
      }
      if (params?.role === 'ADMIN') {
        rows = rows.filter((u) => u.role === 'ADMIN');
      }
      return mockPage(rows, { totalElements: rows.length });
    });

    renderUsers();
    await screen.findByText('Nguyen Van A');

    fireEvent.change(screen.getByPlaceholderText(/Tìm theo họ tên/), {
      target: { value: 'beta' },
    });
    await waitFor(() => {
      expect(screen.getByText('Beta User')).toBeTruthy();
      expect(screen.queryByText('Nguyen Van A')).toBeNull();
    });

    fireEvent.change(screen.getByPlaceholderText(/Tìm theo họ tên/), { target: { value: '' } });
    fireEvent.change(screen.getByDisplayValue('Tất cả vai trò'), { target: { value: 'ADMIN' } });
    await waitFor(() => {
      expect(screen.getByText('Beta User')).toBeTruthy();
      expect(screen.queryByText('Nguyen Van A')).toBeNull();
    });
  });

  it('shows error state and retries', async () => {
    usersApi.listUsersPage
      .mockRejectedValueOnce(new ApiError(500, 'fail'))
      .mockResolvedValueOnce(mockPage([sampleUser()]));

    renderUsers();

    expect(await screen.findByRole('alert')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByText('Nguyen Van A')).toBeTruthy();
    expect(usersApi.listUsersPage).toHaveBeenCalledTimes(2);
  });

  it('creates a user via the API', async () => {
    metricsApi.fetchUserMetrics.mockResolvedValue({ total: 0, active: 0, inactive: 0 });
    usersApi.listUsersPage
      .mockResolvedValueOnce(mockPage([]))
      .mockResolvedValueOnce(mockPage([sampleUser()]));
    usersApi.createUser.mockResolvedValue(sampleUser());

    renderUsers();
    await screen.findByText('Chưa có người dùng nào');

    fireEvent.click(screen.getByRole('button', { name: 'Tạo người dùng' }));
    fireEvent.change(screen.getByLabelText(/^Email/), {
      target: { value: 'student@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Mật khẩu/), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/^Họ tên/), { target: { value: 'Nguyen Van A' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản' }));

    await waitFor(() =>
      expect(usersApi.createUser).toHaveBeenCalledWith('admin-token', {
        email: 'student@example.com',
        password: 'password123',
        fullName: 'Nguyen Van A',
        role: 'STUDENT',
        phone: null,
        dateOfBirth: null,
        avatarUrl: null,
      }),
    );
    expect(await screen.findByRole('status')).toBeTruthy();
  });

  it('deactivates a user after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    usersApi.listUsersPage
      .mockResolvedValueOnce(mockPage([sampleUser()]))
      .mockResolvedValueOnce(mockPage([sampleUser({ active: false })]));
    usersApi.updateUser.mockResolvedValue(sampleUser({ active: false }));

    renderUsers();
    await screen.findByText('Nguyen Van A');

    fireEvent.click(screen.getByRole('button', { name: 'Ngưng hoạt động' }));

    await waitFor(() =>
      expect(usersApi.updateUser).toHaveBeenCalledWith('admin-token', 'u-student', {
        active: false,
      }),
    );
  });

  it('opens edit form with prepopulated values', async () => {
    usersApi.listUsersPage.mockResolvedValue(
      mockPage([sampleUser({ phone: '+84901234567', fullName: 'Edit Me' })]),
    );

    renderUsers();
    await screen.findByText('Edit Me');

    fireEvent.click(screen.getByRole('button', { name: 'Sửa' }));

    expect(await screen.findByRole('heading', { name: 'Chỉnh sửa người dùng' })).toBeTruthy();
    expect((screen.getByLabelText(/^Họ tên/) as HTMLInputElement).value).toBe('Edit Me');
    expect(screen.getByText(/Vai trò: Học viên/)).toBeTruthy();
  });
});
