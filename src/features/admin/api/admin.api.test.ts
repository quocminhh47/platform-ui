import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createCourse,
  listAdminCoursesPage,
  publishCourse,
  unpublishCourse,
  updateCourse,
} from './admin-courses.api';
import { createLesson, listSectionLessons, updateLesson } from './admin-lessons.api';
import { createSection, listCourseSections, updateSection } from './admin-sections.api';
import { createUser, getUserById, listUsersPage, updateUser } from './admin-users.api';

const apiRequest = vi.fn();

vi.mock('../../../services/api/client', () => ({
  apiRequest: (...args: unknown[]) => apiRequest(...args),
}));

const token = 'admin-token';

describe('admin courses api', () => {
  beforeEach(() => {
    apiRequest.mockReset();
    apiRequest.mockResolvedValue({});
  });

  it('lists admin courses with default pagination query params', async () => {
    await listAdminCoursesPage(token);

    expect(apiRequest).toHaveBeenCalledWith('/api/courses?page=0&size=20', { accessToken: token });
  });

  it('creates a course', async () => {
    const body = {
      title: 'New course',
      instructorId: '00000000-0000-4000-8000-000000000001',
      price: 0,
    };
    await createCourse(token, body);

    expect(apiRequest).toHaveBeenCalledWith('/api/courses', {
      method: 'POST',
      accessToken: token,
      body,
    });
  });

  it('updates a course with PUT', async () => {
    const body = { title: 'Updated' };
    await updateCourse(token, 'course-1', body);

    expect(apiRequest).toHaveBeenCalledWith('/api/courses/course-1', {
      method: 'PUT',
      accessToken: token,
      body,
    });
  });

  it('publishes a course', async () => {
    await publishCourse(token, 'course-1');

    expect(apiRequest).toHaveBeenCalledWith('/api/courses/course-1/publish', {
      method: 'POST',
      accessToken: token,
    });
  });

  it('unpublishes a course', async () => {
    await unpublishCourse(token, 'course-1');

    expect(apiRequest).toHaveBeenCalledWith('/api/courses/course-1/unpublish', {
      method: 'POST',
      accessToken: token,
    });
  });
});

describe('admin users api', () => {
  beforeEach(() => {
    apiRequest.mockReset();
    apiRequest.mockResolvedValue([]);
  });

  it('lists users with default pagination query params', async () => {
    await listUsersPage(token);

    expect(apiRequest).toHaveBeenCalledWith('/api/users?page=0&size=20', { accessToken: token });
  });

  it('lists users filtered by email query param', async () => {
    await listUsersPage(token, { email: 'instructor@example.com' });

    expect(apiRequest).toHaveBeenCalledWith('/api/users?email=instructor%40example.com&page=0&size=20', {
      accessToken: token,
    });
  });

  it('gets a user by id', async () => {
    await getUserById(token, 'user-1');

    expect(apiRequest).toHaveBeenCalledWith('/api/users/user-1', { accessToken: token });
  });

  it('creates a user', async () => {
    const body = {
      email: 'new@example.com',
      password: 'password123',
      fullName: 'New User',
      role: 'STUDENT' as const,
    };
    await createUser(token, body);

    expect(apiRequest).toHaveBeenCalledWith('/api/users', {
      method: 'POST',
      accessToken: token,
      body,
    });
  });

  it('updates a user', async () => {
    const body = { fullName: 'Updated', active: false };
    await updateUser(token, 'user-1', body);

    expect(apiRequest).toHaveBeenCalledWith('/api/users/user-1', {
      method: 'PUT',
      accessToken: token,
      body,
    });
  });
});

describe('admin sections api', () => {
  beforeEach(() => {
    apiRequest.mockReset();
    apiRequest.mockResolvedValue([]);
  });

  it('lists sections for a course', async () => {
    await listCourseSections(token, 'course-1');

    expect(apiRequest).toHaveBeenCalledWith('/api/courses/course-1/sections', {
      accessToken: token,
    });
  });

  it('creates a section', async () => {
    const body = { title: 'Section 1', sortOrder: 0 };
    await createSection(token, 'course-1', body);

    expect(apiRequest).toHaveBeenCalledWith('/api/courses/course-1/sections', {
      method: 'POST',
      accessToken: token,
      body,
    });
  });

  it('updates a section', async () => {
    const body = { title: 'Renamed' };
    await updateSection(token, 'course-1', 'section-1', body);

    expect(apiRequest).toHaveBeenCalledWith('/api/courses/course-1/sections/section-1', {
      method: 'PUT',
      accessToken: token,
      body,
    });
  });
});

describe('admin lessons api', () => {
  beforeEach(() => {
    apiRequest.mockReset();
    apiRequest.mockResolvedValue([]);
  });

  it('lists lessons for a section', async () => {
    await listSectionLessons(token, 'course-1', 'section-1');

    expect(apiRequest).toHaveBeenCalledWith(
      '/api/courses/course-1/sections/section-1/lessons',
      { accessToken: token },
    );
  });

  it('creates a lesson', async () => {
    const body = { title: 'Intro', lessonType: 'VIDEO' as const };
    await createLesson(token, 'course-1', 'section-1', body);

    expect(apiRequest).toHaveBeenCalledWith(
      '/api/courses/course-1/sections/section-1/lessons',
      {
        method: 'POST',
        accessToken: token,
        body,
      },
    );
  });

  it('updates a lesson', async () => {
    const body = { sortOrder: 2 };
    await updateLesson(token, 'course-1', 'section-1', 'lesson-1', body);

    expect(apiRequest).toHaveBeenCalledWith(
      '/api/courses/course-1/sections/section-1/lessons/lesson-1',
      {
        method: 'PUT',
        accessToken: token,
        body,
      },
    );
  });
});
