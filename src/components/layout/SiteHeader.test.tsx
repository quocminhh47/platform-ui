import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../app/providers/AuthProvider';
import * as authApi from '../../features/auth/api/auth.api';
import { setAccessToken } from '../../services/api/token-storage';
import type { User } from '../../features/auth/types/auth.types';
import { SiteHeader } from './SiteHeader';

vi.mock('../../features/auth/api/auth.api', () => ({
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

const api = vi.mocked(authApi);

const baseUser = {
  avatarUrl: null,
  active: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
} satisfies Partial<User>;

const student: User = {
  ...baseUser,
  id: 'u1',
  email: 'student@example.com',
  fullName: 'Minh Student',
  role: 'STUDENT',
};

const instructor: User = {
  ...baseUser,
  id: 'i1',
  email: 'instructor@example.com',
  fullName: 'Lan Instructor',
  role: 'INSTRUCTOR',
};

const admin: User = {
  ...baseUser,
  id: 'a1',
  email: 'admin@example.com',
  fullName: 'Admin User',
  role: 'ADMIN',
};

function renderHeader(path = '/', user?: User) {
  if (user) {
    setAccessToken('token');
    api.fetchCurrentUser.mockResolvedValue(user);
  }
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <SiteHeader />
      </MemoryRouter>
    </AuthProvider>,
  );
}

beforeEach(() => {
  sessionStorage.clear();
  api.fetchCurrentUser.mockReset();
});

describe('SiteHeader navigation roles', () => {
  it('shows personal dropdown for STUDENT without system administration entry', async () => {
    renderHeader('/courses', student);

    expect(screen.getByRole('link', { name: 'Trang chủ', hidden: true })).toBeTruthy();
    const trigger = await screen.findByRole('button', { name: /Minh Student/ });
    fireEvent.click(trigger);

    expect(screen.getByRole('menuitem', { name: 'Quản trị cá nhân' }).getAttribute('href')).toBe(
      '/account',
    );
    expect(screen.getByRole('menuitem', { name: 'Đăng xuất' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Quản trị hệ thống', hidden: true })).toBeNull();
    expect(screen.queryByRole('menuitem', { name: 'Quản trị hệ thống' })).toBeNull();
  });

  it('shows personal dropdown for INSTRUCTOR without system administration entry', async () => {
    renderHeader('/', instructor);

    const trigger = await screen.findByRole('button', { name: /Lan Instructor/ });
    fireEvent.click(trigger);

    expect(screen.getByRole('menuitem', { name: 'Quản trị cá nhân' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Quản trị hệ thống', hidden: true })).toBeNull();
  });

  it('shows personal dropdown and system administration for ADMIN', async () => {
    renderHeader('/courses', admin);

    const adminLink = await screen.findByRole('link', {
      name: 'Quản trị hệ thống',
      hidden: true,
    });
    expect(adminLink.getAttribute('href')).toBe('/admin');

    const trigger = await screen.findByRole('button', { name: /Admin User/ });
    fireEvent.click(trigger);

    expect(screen.getByRole('menuitem', { name: 'Quản trị cá nhân' }).getAttribute('href')).toBe(
      '/account',
    );
    expect(screen.queryByRole('menuitem', { name: 'Quản trị hệ thống' })).toBeNull();
  });

  it('hides personal and admin actions for guests', async () => {
    renderHeader('/');
    await screen.findByRole('link', { name: 'Đăng nhập' });
    expect(screen.queryByRole('menuitem', { name: 'Quản trị cá nhân' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Quản trị hệ thống', hidden: true })).toBeNull();
  });
});
