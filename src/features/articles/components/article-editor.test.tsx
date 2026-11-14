import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../app/providers/AuthProvider';
import { ToastProvider } from '../../../components/feedback/ToastProvider';
import { setAccessToken } from '../../../services/api/token-storage';
import * as authApi from '../../auth/api/auth.api';
import * as manageApi from '../api/manage-articles.api';
import { ArticleEditor } from './ArticleEditor';

vi.mock('../../auth/api/auth.api', () => ({
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('../api/manage-articles.api');

vi.mock('./RichTextEditor', () => ({
  RichTextEditor: ({
    onHtmlChange,
    initialHtml,
  }: {
    onHtmlChange: (html: string) => void;
    initialHtml: string;
  }) => (
    <textarea
      aria-label="Nội dung"
      defaultValue={initialHtml}
      onChange={(event) => onHtmlChange(event.target.value)}
    />
  ),
}));

const auth = vi.mocked(authApi);
const manage = vi.mocked(manageApi);

const student = {
  id: 'u1',
  email: 's@example.com',
  fullName: 'Student',
  firstName: null,
  lastName: null,
  phone: null,
  dateOfBirth: null,
  role: 'STUDENT' as const,
  avatarUrl: null,
  active: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function renderEditor() {
  return render(
    <AuthProvider>
      <ToastProvider>
        <MemoryRouter>
          <ArticleEditor mode="create" />
        </MemoryRouter>
      </ToastProvider>
    </AuthProvider>,
  );
}

beforeEach(() => {
  setAccessToken('token');
  auth.fetchCurrentUser.mockResolvedValue(student);
  manage.createArticle.mockReset();
  manage.submitArticle.mockReset();
});

describe('ArticleEditor', () => {
  it('shows validation errors for empty submit', async () => {
    renderEditor();
    expect(await screen.findByRole('button', { name: 'Gửi duyệt' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Gửi duyệt' }));

    expect(await screen.findByText(/Tiêu đề không được để trống/)).toBeTruthy();
    expect(manage.createArticle).not.toHaveBeenCalled();
  });

  it('creates draft on save', async () => {
    manage.createArticle.mockResolvedValue({
      id: 'a1',
      slug: 'hello',
      status: 'DRAFT',
    } as never);

    renderEditor();
    await screen.findByRole('button', { name: 'Lưu nháp' });

    fireEvent.change(screen.getByRole('textbox', { name: /Tiêu đề/ }), {
      target: { value: 'Hello' },
    });
    fireEvent.change(screen.getByLabelText('Nội dung'), {
      target: { value: '<p>Body text</p>' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Lưu nháp' }));

    await waitFor(() => {
      expect(manage.createArticle).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ title: 'Hello', contentHtml: '<p>Body text</p>' }),
      );
    });
  });

  it('creates then submits for approval', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    manage.createArticle.mockResolvedValue({
      id: 'a1',
      slug: 'post',
      status: 'DRAFT',
    } as never);
    manage.submitArticle.mockResolvedValue({
      id: 'a1',
      status: 'PENDING_REVIEW',
    } as never);

    renderEditor();
    await screen.findByRole('button', { name: 'Gửi duyệt' });

    fireEvent.change(screen.getByRole('textbox', { name: /Tiêu đề/ }), {
      target: { value: 'Post' },
    });
    fireEvent.change(screen.getByLabelText('Nội dung'), {
      target: { value: '<p>Ready</p>' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Gửi duyệt' }));

    await waitFor(() => {
      expect(manage.submitArticle).toHaveBeenCalledWith(expect.any(String), 'a1');
    });
  });
});

it('applies a returned article even when its timestamp is unchanged and hides unpublished public links', async () => {
  const article = { id: 'same', slug: 'draft', title: 'Before', status: 'DRAFT', contentHtml: '<p>Body</p>', updatedAt: '2026-01-01' } as import('../types/manage-article.types').ManageArticle;
  const view = (value: typeof article) => <AuthProvider><ToastProvider><MemoryRouter>
    <ArticleEditor mode="edit" article={value} />
  </MemoryRouter></ToastProvider></AuthProvider>;
  const { rerender } = render(view(article));
  await screen.findByRole('button', { name: 'Lưu nháp' });
  expect(screen.queryByRole('link', { name: 'Xem bài công khai' })).toBeNull();
  rerender(view({ ...article, title: 'Returned normalized title' }));
  await waitFor(() => expect((screen.getByRole('textbox', { name: /Tiêu đề/ }) as HTMLInputElement).value).toBe('Returned normalized title'));
});
