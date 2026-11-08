import { fireEvent, render, screen } from '@testing-library/react';
import { ArticleEditorModeToggle } from './ArticleEditorModeToggle';

describe('ArticleEditorModeToggle', () => {
  it('switches between compose and preview modes', () => {
    const onChange = vi.fn();
    render(<ArticleEditorModeToggle showPreview={false} onChange={onChange} />);

    expect(screen.getByRole('button', { name: 'Soạn thảo' }).getAttribute('aria-pressed')).toBe(
      'true',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Xem trước' }));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
