import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminQuizBuilderForm } from './components/AdminQuizBuilderForm';
import {
  emptyQuizBuilderForm,
  type QuizBuilderFormValues,
} from './validation/admin-quiz-form.validation';

function renderForm(
  initialValues?: QuizBuilderFormValues,
  options?: { submitting?: boolean },
) {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  render(
    <AdminQuizBuilderForm
      initialValues={initialValues ?? emptyQuizBuilderForm()}
      questionsLocked={false}
      formError={null}
      attemptsLockedBanner={null}
      submitting={options?.submitting ?? false}
      onSubmit={onSubmit}
    />,
  );
  return { onSubmit };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AdminQuizBuilderForm', () => {
  it('uses radio correct-answer controls for SINGLE_CHOICE', () => {
    renderForm();
    const radios = screen.getAllByRole('radio', { name: /Đáp án đúng/ });
    expect(radios.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole('group', { name: 'Danh sách lựa chọn' })).toBeTruthy();
  });

  it('configures TRUE_FALSE with Đúng and Sai and selectable correct answer', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText(/^Loại câu hỏi/), {
      target: { value: 'TRUE_FALSE' },
    });
    const card = screen.getByRole('article');
    expect(within(card).getByText('Sai')).toBeTruthy();
    expect(within(card).getAllByText('Đúng').length).toBeGreaterThan(0);
    const saiCorrect = screen.getByRole('radio', { name: 'Đáp án đúng B' });
    fireEvent.click(saiCorrect);
    expect((saiCorrect as HTMLInputElement).checked).toBe(true);
  });

  it('duplicates and reorders questions', () => {
    const initial = emptyQuizBuilderForm();
    initial.questions[0].questionText = 'Câu một';
    renderForm(initial);

    fireEvent.click(screen.getByRole('button', { name: 'Nhân bản' }));
    expect(screen.getByText(/Câu 2:/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Di chuyển câu 1 xuống' }));

    const textareas = screen.getAllByLabelText(/^Nội dung câu hỏi/) as HTMLTextAreaElement[];
    expect(textareas[0].value).toContain('bản sao');
    expect(textareas[1].value).toBe('Câu một');
  });

  it('removes a question after confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const initial = emptyQuizBuilderForm();
    initial.questions = [initial.questions[0], { ...initial.questions[0], key: 'q2' }];
    renderForm(initial);

    fireEvent.click(screen.getByRole('button', { name: 'Xóa câu 1' }));
    expect(screen.queryByText(/Câu 2:/)).toBeNull();
    expect(screen.getByText(/Câu 1:/)).toBeTruthy();
  });

  it('keeps a question when delete confirmation is canceled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const initial = emptyQuizBuilderForm();
    initial.questions = [initial.questions[0], { ...initial.questions[0], key: 'q2' }];
    renderForm(initial);

    fireEvent.click(screen.getByRole('button', { name: 'Xóa câu 1' }));
    expect(screen.getByText(/Câu 2:/)).toBeTruthy();
  });

  it('collapses question body without clearing inputs', () => {
    renderForm();
    const textarea = screen.getByLabelText(/^Nội dung câu hỏi/);
    fireEvent.change(textarea, { target: { value: 'Nội dung giữ lại' } });

    const toggle = screen.getByRole('button', { name: /Câu 1:/ });
    fireEvent.click(toggle);
    expect(screen.queryByLabelText(/^Nội dung câu hỏi/)).toBeNull();

    fireEvent.click(toggle);
    expect((screen.getByLabelText(/^Nội dung câu hỏi/) as HTMLTextAreaElement).value).toBe(
      'Nội dung giữ lại',
    );
  });

  it('preserves question text when validation fails on submit', async () => {
    const { onSubmit } = renderForm();
    fireEvent.change(screen.getByLabelText(/^Nội dung câu hỏi/), {
      target: { value: 'Câu chưa đủ đáp án' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu quiz' }));

    expect(await screen.findByText(/Mỗi lựa chọn phải có nội dung/)).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
    expect((screen.getByLabelText(/^Nội dung câu hỏi/) as HTMLTextAreaElement).value).toBe(
      'Câu chưa đủ đáp án',
    );
  });

  it('prevents duplicate submit while save is in flight', async () => {
    let resolveSubmit!: () => void;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
    );
    const initial = emptyQuizBuilderForm();
    initial.questions[0].questionText = 'OK?';
    initial.questions[0].options[0].optionText = 'A';
    initial.questions[0].options[0].isCorrect = true;
    initial.questions[0].options[1].optionText = 'B';

    render(
      <AdminQuizBuilderForm
        initialValues={initial}
        questionsLocked={false}
        formError={null}
        attemptsLockedBanner={null}
        submitting={false}
        onSubmit={onSubmit}
      />,
    );

    const save = screen.getByRole('button', { name: 'Lưu quiz' });
    fireEvent.click(save);
    fireEvent.click(save);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    resolveSubmit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  it('adds and removes an answer option when confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: '+ Thêm lựa chọn' }));
    expect(screen.getByLabelText(/Nội dung lựa chọn C/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Xóa lựa chọn C' }));
    expect(screen.queryByLabelText(/Nội dung lựa chọn C/)).toBeNull();
  });

  it('shows quiz settings section and question list headings', () => {
    renderForm();
    expect(screen.getByRole('heading', { name: 'Cài đặt quiz' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Câu hỏi' })).toBeTruthy();
  });

  it('uses checkboxes for MULTIPLE_CHOICE correct answers', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText(/^Loại câu hỏi/), {
      target: { value: 'MULTIPLE_CHOICE' },
    });
    const card = screen.getByRole('article');
    const checkboxes = within(card).getAllByRole('checkbox', { name: /Đáp án đúng/ });
    expect(checkboxes.length).toBeGreaterThanOrEqual(2);
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(true);
  });
});
