import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomeCourseCard } from '../../pages/home/HomeCourseCard';
import { CourseCard } from './components/CourseCard';
import type { Course } from './types/course.types';

const base: Course = {
  id: 'c1',
  title: 'HSK 1',
  description: 'Intro',
  instructorId: 'i1',
  price: 0,
  published: true,
  finalQuizId: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function renderAll(course: Course) {
  render(
    <MemoryRouter>
      <CourseCard course={course} />
      <CourseCard course={course} variant="catalog" />
      <HomeCourseCard course={course} />
    </MemoryRouter>,
  );
}

describe('course cards use one price format', () => {
  it('shows "Miễn phí" on every card variant for free courses', () => {
    renderAll(base);
    expect(screen.getAllByText('Miễn phí')).toHaveLength(3);
  });

  it('shows VND with currency and no raw numbers for paid courses', () => {
    renderAll({ ...base, price: 79 });
    expect(screen.queryByText('79')).toBeNull();
    expect(screen.getAllByText((text) => /^79\s₫$/.test(text.replace(/\s/g, ' ')))).toHaveLength(3);
  });
});
