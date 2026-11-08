import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../app/providers/AuthProvider';
import * as authApi from '../../auth/api/auth.api';
import { setAccessToken } from '../../../services/api/token-storage';
import type { User } from '../../auth/types/auth.types';
import { AccountPage } from './AccountPage';

vi.mock('../../auth/api/auth.api', () => ({
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

const api = vi.mocked(authApi);

const student: User = {
  id: 'u1',
  email: 'student@example.com',
  fullName: 'Minh Student',
  role: 'STUDENT',
  avatarUrl: null,
  active: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

beforeEach(() => {
  sessionStorage.clear();
  api.fetchCurrentUser.mockReset();
});

describe('AccountPage', () => {
  it('renders profile inside the member dashboard shell with sidebar', async () => {
    setAccessToken('token');
    api.fetchCurrentUser.mockResolvedValue(student);

    render(
      <AuthProvider>
        <MemoryRouter>
          <AccountPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'Hồ sơ cá nhân' })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Bảng điều khiển' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Khóa học của tôi' })).toBeTruthy();
  });
});
