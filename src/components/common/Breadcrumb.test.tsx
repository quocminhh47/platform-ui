import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Breadcrumb } from './Breadcrumb';

describe('Breadcrumb', () => {
  it('renders links and marks the current page', () => {
    render(
      <MemoryRouter>
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Khóa học', href: '/courses' },
            { label: 'HSK 1' },
          ]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Trang chủ' }).getAttribute('href')).toBe('/');
    expect(screen.getByRole('link', { name: 'Khóa học' }).getAttribute('href')).toBe('/courses');
    const current = screen.getByText('HSK 1');
    expect(current.getAttribute('aria-current')).toBe('page');
    expect(screen.queryByRole('link', { name: 'HSK 1' })).toBeNull();
  });
});
