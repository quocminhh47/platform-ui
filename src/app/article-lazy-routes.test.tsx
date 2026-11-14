import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuth } from '../features/auth/hooks/useAuth';
import { ToastProvider } from '../components/feedback/ToastProvider';

vi.mock('../features/auth/hooks/useAuth');
vi.mock('../features/dashboard/pages/DashboardPage', () => ({ DashboardPage: () => <h1>Dashboard</h1> }));
vi.mock('../features/articles/pages/ArticleCreatePage', () => ({ ArticleCreatePage: () => <h1>Lazy create loaded</h1> }));
vi.mock('../features/articles/pages/ArticleEditPage', () => ({ ArticleEditPage: () => <h1>Lazy edit loaded</h1> }));
vi.mock('../features/articles/pages/AdminArticleCreatePage', () => ({ AdminArticleCreatePage: () => <h1>Lazy admin create loaded</h1> }));
function mount(path: string, role?: 'ADMIN' | 'STUDENT' | 'INSTRUCTOR') {
  vi.mocked(useAuth).mockReturnValue({
    user: role ? { id: 'user', role, fullName: 'User' } : null,
    accessToken: role ? 'token' : null, isInitializing: false, isAuthenticated: Boolean(role),
    logout: vi.fn(), login: vi.fn(), register: vi.fn(),
  } as ReturnType<typeof useAuth>);
  const testRouter = createMemoryRouter(router.routes, { initialEntries: [path] });
  render(<ToastProvider><RouterProvider router={testRouter} /></ToastProvider>);
  return testRouter;
}
it.each(['/articles/create', '/articles/edit/a1'])('retains the authentication guard on %s', async path => {
  const instance = mount(path);
  expect(await screen.findByRole('heading', { name: 'Đăng nhập' })).toBeTruthy();
  expect(instance.state.location.pathname).toBe('/login');
  expect(screen.queryByText(/Lazy .* loaded/)).toBeNull();
});
it.each(['STUDENT', 'INSTRUCTOR'] as const)('retains the admin guard for %s', async role => {
  const instance = mount('/admin/articles/new', role);
  await waitFor(() => expect(instance.state.location.pathname).toBe('/dashboard'));
  expect(screen.queryByText('Lazy admin create loaded')).toBeNull();
});
it.each([
  ['/articles/create', 'Lazy create loaded'],
  ['/articles/edit/a1', 'Lazy edit loaded'],
  ['/admin/articles/new', 'Lazy admin create loaded'],
])('loads the editor page at %s for ADMIN', async (path, title) => {
  mount(path, 'ADMIN');
  expect(await screen.findByRole('heading', { name: title })).toBeTruthy();
});
