import type { QuizQuestionStudentView } from '../types/quiz.types';

type QuizQuestionCardProps = {
  index: number;
  question: QuizQuestionStudentView;
  selectedOptionIds: string[];
  disabled: boolean;
  onSelect: (optionId: string) => void;
};

export function QuizQuestionCard({
  index,
  question,
  selectedOptionIds,
  disabled,
  onSelect,
}: QuizQuestionCardProps) {
  const multiple = question.questionType === 'MULTIPLE_CHOICE';
  const inputType = multiple ? 'checkbox' : 'radio';

  return (
    <fieldset className="quiz-question" disabled={disabled}>
      <legend className="quiz-question-title">
        Câu {index + 1}. {question.questionText}
      </legend>
      <ul className="quiz-options">
        {question.options.map((option) => {
          const checked = selectedOptionIds.includes(option.id);
          const name = multiple ? undefined : `question-${question.id}`;
          return (
            <li key={option.id}>
              <label className={checked ? 'quiz-option is-selected' : 'quiz-option'}>
                <input
                  type={inputType}
                  name={name}
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onSelect(option.id)}
                />
                <span>{option.optionText}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
