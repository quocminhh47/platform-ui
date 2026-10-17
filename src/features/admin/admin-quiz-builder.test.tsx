import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdminQuizBuilderForm } from './components/AdminQuizBuilderForm';
import {
  emptyQuizBuilderForm,
  type QuizBuilderFormValues,
} from './validation/admin-quiz-form.validation';

function renderForm(initialValues?: QuizBuilderFormValues) {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  render(
    <AdminQuizBuilderForm
      initialValues={initialValues ?? emptyQuizBuilderForm()}
      questionsLocked={false}
      formError={null}
      attemptsLockedBanner={null}
      submitting={false}
      onSubmit={onSubmit}
    />,
  );
  return { onSubmit };
}

describe('AdminQuizBuilderForm', () => {
  it('uses radio correct-answer controls for SINGLE_CHOICE', () => {
    renderForm();
    const radios = screen.getAllByRole('radio', { name: /Đáp án đúng/ });
    expect(radios.length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText(/^Đúng$/)).toBeNull();
    expect(screen.getByText('Đáp án đúng')).toBeTruthy();
  });

  it('configures TRUE_FALSE with Đúng and Sai and selectable correct answer', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText(/^Loại câu hỏi/), {
      target: { value: 'TRUE_FALSE' },
    });
    expect(screen.getByText('Đúng')).toBeTruthy();
    expect(screen.getByText('Sai')).toBeTruthy();
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

  it('removes a question with the delete control', () => {
    const initial = emptyQuizBuilderForm();
    initial.questions = [initial.questions[0], { ...initial.questions[0], key: 'q2' }];
    renderForm(initial);

    fireEvent.click(screen.getByRole('button', { name: 'Xóa câu 1' }));
    expect(screen.queryByText(/Câu 2:/)).toBeNull();
    expect(screen.getByText(/Câu 1:/)).toBeTruthy();
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
