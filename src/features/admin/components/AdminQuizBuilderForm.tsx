import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { FormField } from '../../auth/components/FormField';
import type { QuestionType } from '../types/admin-quiz.types';
import {
  addOptionToQuestion,
  applyQuestionTypeChange,
  duplicateQuestion,
  optionDisplayLabel,
  questionTypeLabel,
  removeOptionFromQuestion,
  reorderQuestions,
  setSingleCorrectOption,
  toggleMultipleCorrectOption,
} from '../utils/admin-quiz-form.utils';
import {
  emptyQuestion,
  validateQuizBuilderForm,
  type QuizBuilderFormValues,
  type QuizQuestionFormValues,
} from '../validation/admin-quiz-form.validation';

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'SINGLE_CHOICE', label: 'Trắc nghiệm một đáp án' },
  { value: 'MULTIPLE_CHOICE', label: 'Trắc nghiệm nhiều đáp án' },
  { value: 'TRUE_FALSE', label: 'Đúng / Sai' },
];

type AdminQuizBuilderFormProps = {
  initialValues: QuizBuilderFormValues;
  questionsLocked: boolean;
  formError: string | null;
  attemptsLockedBanner: string | null;
  submitting: boolean;
  onSubmit: (values: QuizBuilderFormValues) => Promise<void>;
};

export function AdminQuizBuilderForm({
  initialValues,
  questionsLocked,
  formError,
  attemptsLockedBanner,
  submitting,
  onSubmit,
}: AdminQuizBuilderFormProps) {
  const [values, setValues] = useState(initialValues);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [collapsedKeys, setCollapsedKeys] = useState<Set<string>>(() => new Set());

  const clientErrors = useMemo(
    () => validateQuizBuilderForm(values, { questionsRequired: !questionsLocked }),
    [values, questionsLocked],
  );

  const toggleCollapsed = useCallback((key: string) => {
    setCollapsedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setSubmitAttempted(true);
    if (Object.keys(clientErrors.settings ?? {}).length > 0) {
      return;
    }
    if (!questionsLocked && (clientErrors.questions || clientErrors.form)) {
      return;
    }
    await onSubmit(values);
  }

  return (
    <form className="auth-form admin-form admin-quiz-form" onSubmit={handleSubmit} noValidate>
      {attemptsLockedBanner ? (
        <div className="admin-quiz-banner" role="status">
          <p>{attemptsLockedBanner}</p>
        </div>
      ) : null}
      {formError ? (
        <div className="section-error" role="alert">
          <p>{formError}</p>
        </div>
      ) : null}

      <div className="admin-quiz-layout">
      <fieldset className="admin-quiz-settings">
        <legend>Cài đặt quiz</legend>
        <FormField
          id="quiz-passing-score"
          label="Điểm đạt (%)"
          required
          error={submitAttempted ? clientErrors.settings?.passingScore : undefined}
        >
          <input
            id="quiz-passing-score"
            inputMode="numeric"
            value={values.settings.passingScore}
            disabled={submitting}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                settings: { ...current.settings, passingScore: event.target.value },
              }))
            }
          />
        </FormField>
        <FormField
          id="quiz-time-limit"
          label="Thời gian (phút)"
          hint="Tùy chọn."
          error={submitAttempted ? clientErrors.settings?.timeLimitMinutes : undefined}
        >
          <input
            id="quiz-time-limit"
            inputMode="numeric"
            value={values.settings.timeLimitMinutes}
            disabled={submitting}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                settings: { ...current.settings, timeLimitMinutes: event.target.value },
              }))
            }
          />
        </FormField>
        <FormField
          id="quiz-max-attempts"
          label="Số lần làm tối đa"
          hint="Tùy chọn."
          error={submitAttempted ? clientErrors.settings?.maxAttempts : undefined}
        >
          <input
            id="quiz-max-attempts"
            inputMode="numeric"
            value={values.settings.maxAttempts}
            disabled={submitting}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                settings: { ...current.settings, maxAttempts: event.target.value },
              }))
            }
          />
        </FormField>
      </fieldset>

      {!questionsLocked ? (
        <div className="admin-quiz-questions">
          <div className="admin-quiz-questions-header">
            <h2>Câu hỏi</h2>
            <button
              type="button"
              className="button-secondary"
              disabled={submitting}
              onClick={() =>
                setValues((current) => ({
                  ...current,
                  questions: [...current.questions, emptyQuestion()],
                }))
              }
            >
              + Thêm câu hỏi
            </button>
          </div>
          {submitAttempted && clientErrors.form ? (
            <p className="field-error" role="alert">{clientErrors.form}</p>
          ) : null}
          <div className="admin-quiz-questions-grid">
          {values.questions.map((question, index) => (
            <QuestionEditor
              key={question.key}
              index={index}
              totalQuestions={values.questions.length}
              question={question}
              collapsed={collapsedKeys.has(question.key)}
              errors={submitAttempted ? clientErrors.questions?.[question.key] : undefined}
              submitting={submitting}
              onToggleCollapse={() => toggleCollapsed(question.key)}
              onChange={(next) =>
                setValues((current) => ({
                  ...current,
                  questions: current.questions.map((q) =>
                    q.key === question.key ? next : q,
                  ),
                }))
              }
              onDuplicate={() =>
                setValues((current) => {
                  const position = current.questions.findIndex((q) => q.key === question.key);
                  const copy = duplicateQuestion(question);
                  const next = [...current.questions];
                  next.splice(position + 1, 0, copy);
                  return { ...current, questions: next };
                })
              }
              onMoveUp={() =>
                setValues((current) => ({
                  ...current,
                  questions: reorderQuestions(current.questions, index, 'up'),
                }))
              }
              onMoveDown={() =>
                setValues((current) => ({
                  ...current,
                  questions: reorderQuestions(current.questions, index, 'down'),
                }))
              }
              onRemove={
                values.questions.length > 1
                  ? () => {
                      setCollapsedKeys((current) => {
                        const next = new Set(current);
                        next.delete(question.key);
                        return next;
                      });
                      setValues((current) => ({
                        ...current,
                        questions: current.questions.filter((q) => q.key !== question.key),
                      }));
                    }
                  : undefined
              }
            />
          ))}
          </div>
        </div>
      ) : (
        <p className="muted admin-quiz-locked-note admin-quiz-locked-note-span">
          Phần câu hỏi đã khóa vì đã có lượt làm bài. Bạn vẫn có thể cập nhật cài đặt phía trên.
        </p>
      )}
      </div>

      <div className="admin-form-actions">
        <button type="submit" className="button-primary" disabled={submitting}>
          {submitting ? 'Đang lưu…' : 'Lưu quiz'}
        </button>
      </div>
    </form>
  );
}

type QuestionEditorProps = {
  index: number;
  totalQuestions: number;
  question: QuizQuestionFormValues;
  collapsed: boolean;
  errors?: { questionText?: string; scoreWeight?: string; options?: string };
  submitting: boolean;
  onToggleCollapse: () => void;
  onChange: (question: QuizQuestionFormValues) => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove?: () => void;
};

function QuestionEditor({
  index,
  totalQuestions,
  question,
  collapsed,
  errors,
  submitting,
  onToggleCollapse,
  onChange,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onRemove,
}: QuestionEditorProps) {
  const summary =
    question.questionText.trim() || 'Chưa có nội dung câu hỏi';
  const typeLabel = questionTypeLabel(question.questionType);
  const isTrueFalse = question.questionType === 'TRUE_FALSE';
  const isMultiple = question.questionType === 'MULTIPLE_CHOICE';
  const correctControlType = isMultiple ? 'checkbox' : 'radio';

  return (
    <article className="admin-quiz-question-card" data-collapsed={collapsed ? 'true' : 'false'}>
      <header className="admin-quiz-question-header">
        <div className="admin-quiz-question-heading">
          <button
            type="button"
            className="admin-quiz-collapse-toggle"
            aria-expanded={!collapsed}
            aria-controls={`question-panel-${question.key}`}
            disabled={submitting}
            onClick={onToggleCollapse}
          >
            <span className="admin-quiz-question-title">
              Câu {index + 1}: {collapsed ? summary : typeLabel}
            </span>
            <span className="admin-quiz-collapse-icon" aria-hidden="true">
              {collapsed ? '▸' : '▾'}
            </span>
          </button>
          {!collapsed ? (
            <span className="admin-quiz-question-type-badge">{typeLabel}</span>
          ) : null}
        </div>
        <div className="admin-quiz-question-toolbar">
          <button
            type="button"
            className="icon-button admin-quiz-icon-button"
            title="Di chuyển lên"
            aria-label={`Di chuyển câu ${index + 1} lên`}
            disabled={submitting || index === 0}
            onClick={onMoveUp}
          >
            ↑
          </button>
          <button
            type="button"
            className="icon-button admin-quiz-icon-button"
            title="Di chuyển xuống"
            aria-label={`Di chuyển câu ${index + 1} xuống`}
            disabled={submitting || index >= totalQuestions - 1}
            onClick={onMoveDown}
          >
            ↓
          </button>
          <button
            type="button"
            className="button-secondary"
            disabled={submitting}
            onClick={onDuplicate}
          >
            Nhân bản
          </button>
          {onRemove ? (
            <button
              type="button"
              className="icon-button admin-quiz-icon-button admin-quiz-icon-button-danger"
              title="Xóa câu hỏi"
              aria-label={`Xóa câu ${index + 1}`}
              disabled={submitting}
              onClick={onRemove}
            >
              <TrashIcon />
            </button>
          ) : null}
        </div>
      </header>

      {!collapsed ? (
        <div id={`question-panel-${question.key}`} className="admin-quiz-question-body">
          <FormField
            id={`q-text-${question.key}`}
            label="Nội dung câu hỏi"
            required
            error={errors?.questionText}
          >
            <textarea
              id={`q-text-${question.key}`}
              rows={2}
              value={question.questionText}
              disabled={submitting}
              onChange={(event) => onChange({ ...question, questionText: event.target.value })}
            />
          </FormField>
          <FormField id={`q-type-${question.key}`} label="Loại câu hỏi" required>
            <select
              id={`q-type-${question.key}`}
              value={question.questionType}
              disabled={submitting}
              onChange={(event) =>
                onChange(applyQuestionTypeChange(question, event.target.value as QuestionType))
              }
            >
              {QUESTION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField
            id={`q-weight-${question.key}`}
            label="Điểm câu hỏi"
            error={errors?.scoreWeight}
          >
            <input
              id={`q-weight-${question.key}`}
              inputMode="numeric"
              value={question.scoreWeight}
              disabled={submitting}
              onChange={(event) => onChange({ ...question, scoreWeight: event.target.value })}
            />
          </FormField>

          <div className="admin-quiz-options">
            <p className="admin-field-label">Lựa chọn</p>
            <p className="admin-field-label admin-quiz-correct-group-label">Đáp án đúng</p>
            {errors?.options ? (
              <p className="field-error" role="alert">{errors.options}</p>
            ) : null}
            <ul className="admin-quiz-option-list">
              {question.options.map((option, optionIndex) => {
                const letter = optionDisplayLabel(optionIndex);
                const correctId = `correct-${question.key}-${option.key}`;
                return (
                  <li key={option.key} className="admin-quiz-option-row">
                    <span className="admin-quiz-option-letter" aria-hidden="true">
                      {letter}.
                    </span>
                    <input
                      id={correctId}
                      className="admin-quiz-option-correct-input"
                      type={correctControlType}
                      name={isMultiple ? undefined : `correct-${question.key}`}
                      checked={option.isCorrect}
                      disabled={submitting}
                      aria-label={`Đáp án đúng ${letter}`}
                      onChange={() => {
                        if (isMultiple) {
                          onChange(toggleMultipleCorrectOption(question, option.key));
                        } else {
                          onChange(setSingleCorrectOption(question, option.key));
                        }
                      }}
                    />
                    {isTrueFalse ? (
                      <span className="admin-quiz-option-fixed-text">{option.optionText}</span>
                    ) : (
                      <input
                        type="text"
                        className="admin-quiz-option-text"
                        value={option.optionText}
                        disabled={submitting}
                        placeholder={`Nội dung lựa chọn ${letter}`}
                        aria-label={`Nội dung lựa chọn ${letter}`}
                        onChange={(event) =>
                          onChange({
                            ...question,
                            options: question.options.map((o) =>
                              o.key === option.key ? { ...o, optionText: event.target.value } : o,
                            ),
                          })
                        }
                      />
                    )}
                    {!isTrueFalse && question.options.length > 2 ? (
                      <button
                        type="button"
                        className="icon-button admin-quiz-icon-button admin-quiz-icon-button-danger"
                        title={`Xóa lựa chọn ${letter}`}
                        aria-label={`Xóa lựa chọn ${letter}`}
                        disabled={submitting}
                        onClick={() => onChange(removeOptionFromQuestion(question, option.key))}
                      >
                        <TrashIcon />
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            {!isTrueFalse ? (
              <button
                type="button"
                className="button-secondary"
                disabled={submitting}
                onClick={() => onChange(addOptionToQuestion(question))}
              >
                + Thêm lựa chọn
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 3h6m-8 4h10m-1 14H8a2 2 0 0 1-2-2V7h12v12a2 2 0 0 1-2 2Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
