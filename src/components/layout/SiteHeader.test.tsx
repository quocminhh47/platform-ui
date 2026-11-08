import { render, screen } from '@testing-library/react';
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

function renderHeader(path = '/') {
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

describe('SiteHeader', () => {
  it('exposes Vietnamese account nav labels including Hồ sơ when signed in', async () => {
    setAccessToken('token');
    api.fetchCurrentUser.mockResolvedValue(student);
    renderHeader('/courses');

    const profile = await screen.findByRole('link', { name: 'Hồ sơ', hidden: true });
    expect(profile.textContent).toBe('Hồ sơ');
    expect(screen.getByRole('link', { name: 'Cá nhân', hidden: true }).textContent).toBe('Cá nhân');
    expect(screen.getByRole('link', { name: 'Khóa học của tôi', hidden: true }).textContent).toBe(
      'Khóa học của tôi',
    );
  });
});
