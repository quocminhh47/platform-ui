import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../app/providers/AuthProvider';
import * as authApi from '../../auth/api/auth.api';
import { setAccessToken } from '../../../services/api/token-storage';
import type { User } from '../../auth/types/auth.types';
import { DashboardSidebar } from './DashboardSidebar';

vi.mock('../../auth/api/auth.api', () => ({
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

const api = vi.mocked(authApi);

const admin: User = {
  id: 'admin',
  email: 'admin@example.com',
  fullName: 'Admin',
  role: 'ADMIN',
  avatarUrl: null,
  active: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

beforeEach(() => {
  sessionStorage.clear();
  api.fetchCurrentUser.mockReset();
});

describe('DashboardSidebar', () => {
  it('renders multi-word Vietnamese admin nav labels intact', async () => {
    setAccessToken('token');
    api.fetchCurrentUser.mockResolvedValue(admin);

    render(
      <AuthProvider>
        <MemoryRouter>
          <DashboardSidebar courseCount={3} />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect((await screen.findByRole('link', { name: /Quản lý khóa học/ })).textContent).toContain(
      'Quản lý khóa học',
    );
    expect(screen.getByRole('link', { name: 'Bảng điều khiển' }).textContent).toBe('Bảng điều khiển');
    expect(screen.getByRole('link', { name: 'Khóa học của tôi' }).textContent).toBe('Khóa học của tôi');
    expect(screen.getByRole('link', { name: 'Bài viết' }).getAttribute('href')).toBe('/articles');
  });
});
