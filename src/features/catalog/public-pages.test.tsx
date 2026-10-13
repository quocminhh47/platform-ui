import { fireEvent, render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../app/providers/AuthProvider';
import { AppShell } from '../../components/layout/AppShell';
import { ApiError } from '../../services/api/api-error';
import { setAccessToken } from '../../services/api/token-storage';
import * as authApi from '../auth/api/auth.api';
import type { User } from '../auth/types/auth.types';
import { HomePage } from '../../pages/HomePage';
import * as coursesApi from './api/courses.api';
import { CatalogPage } from './pages/CatalogPage';
import type { Course } from './types/course.types';

vi.mock('../auth/api/auth.api', () => ({
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('./api/courses.api', () => ({
  listPublishedCourses: vi.fn(),
}));

const auth = vi.mocked(authApi);
const courses = vi.mocked(coursesApi);

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

function course(title: string, price = 0): Course {
  return {
    id: title,
    title,
    description: 'A published course',
    instructorId: 'instructor-1',
    price,
    published: true,
    finalQuizId: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppShell />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'courses', element: <CatalogPage /> },
        ],
      },
    ],
    { initialEntries: [path] },
  );
  render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  );
}

beforeEach(() => {
  sessionStorage.clear();
  auth.fetchCurrentUser.mockReset();
  courses.listPublishedCourses.mockReset();
  courses.listPublishedCourses.mockResolvedValue([]);
});

describe('public home', () => {
  it('offers home, catalog, and guest account actions', async () => {
    renderAt('/');

    expect(await screen.findByRole('heading', { name: /course catalog/i })).toBeTruthy();
    const homeLinks = screen.getAllByRole('link', { name: 'Home' });
    expect(homeLinks.length).toBeGreaterThan(0);
    for (const link of homeLinks) {
      expect(link.getAttribute('href')).toBe('/');
    }
    expect(screen.getAllByRole('link', { name: 'Explore courses' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Register' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Dashboard' })).toBeNull();
  });

  it('shows the dashboard action for a signed-in user', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);

    renderAt('/');

    expect(await screen.findByRole('link', { name: 'Dashboard' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Sign in' })).toBeNull();
  });

  it('shows published courses and keeps a contained error from replacing the page', async () => {
    courses.listPublishedCourses.mockResolvedValueOnce([
      course('Intro to Algebra'),
      course('Academic Writing', 49),
      course('Biology Basics'),
      course('Hidden Fourth'),
    ]);

    renderAt('/');

    expect(await screen.findByRole('heading', { name: 'Intro to Algebra' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Academic Writing' })).toBeTruthy();
    expect(screen.getAllByText('Free').length).toBeGreaterThan(0);
    expect(screen.queryByRole('heading', { name: 'Hidden Fourth' })).toBeNull();
    expect(screen.getByRole('link', { name: 'See all 4 courses' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Intro to Algebra' })).toBeNull();
    expect(courses.listPublishedCourses).toHaveBeenCalledWith(null);
    expect(screen.getByRole('heading', { name: 'Why this LMS' })).toBeTruthy();
  });

  it('shows an empty featured section without invented courses', async () => {
    renderAt('/');

    expect(await screen.findByText('No published courses yet')).toBeTruthy();
    expect(screen.getByRole('heading', { name: /Ready to look through the catalog/ })).toBeTruthy();
  });

  it('retries a failed featured-course request without hiding the hero', async () => {
    courses.listPublishedCourses
      .mockRejectedValueOnce(new ApiError(500, 'database exploded'))
      .mockResolvedValueOnce([course('Intro to Algebra')]);

    renderAt('/');

    expect(await screen.findByRole('heading', { name: /course catalog/i })).toBeTruthy();
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).not.toMatch(/database/);

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('heading', { name: 'Intro to Algebra' })).toBeTruthy();
  });
});

describe('public catalog', () => {
  it('lists every published course and does not link the cards', async () => {
    courses.listPublishedCourses.mockResolvedValue([
      course('Intro to Algebra'),
      course('Academic Writing', 49),
    ]);

    renderAt('/courses');

    expect(await screen.findByRole('heading', { name: 'Explore courses' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Intro to Algebra' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Academic Writing' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Intro to Algebra' })).toBeNull();
    expect(screen.queryByRole('button', { name: /enroll|view/i })).toBeNull();
  });

  it('shows an empty catalog', async () => {
    renderAt('/courses');

    expect(await screen.findByText('No published courses')).toBeTruthy();
  });
});
