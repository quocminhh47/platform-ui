import type { QuizQuestionStudentView } from '../types/quiz.types';
import {
  optionLetter,
  questionTypeInstruction,
  questionUsesCharacterDisplay,
} from '../utils/quizQuestionDisplay';
import { QuizOptionCard } from './quiz/QuizOptionCard';

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
  const characterDisplay = questionUsesCharacterDisplay(question.questionText);
  const shortOptions =
    question.options.length <= 4 &&
    question.options.every((option) => option.optionText.length <= 24);

  const promptId = `quiz-question-${question.id}-prompt`;

  return (
    <fieldset
      className="quiz-question-card"
      disabled={disabled}
      aria-labelledby={promptId}
    >
      <div className="quiz-question-card-inner">
        <div className="quiz-question-card-header">
          <span className="quiz-question-number">Câu {index + 1}</span>
          <span className="quiz-question-type-hint">
            ({questionTypeInstruction(question.questionType)})
          </span>
        </div>
        <p
          id={promptId}
          className={
            characterDisplay
              ? 'quiz-question-prompt quiz-question-prompt-han'
              : 'quiz-question-prompt'
          }
        >
          Câu {index + 1}. {question.questionText}
        </p>
        <div
          className={
            shortOptions
              ? 'quiz-options-grid quiz-options-grid-short'
              : 'quiz-options-grid'
          }
          role={multiple ? 'group' : 'radiogroup'}
          aria-label={`Câu hỏi ${index + 1}`}
        >
          {question.options.map((option, optionIndex) => {
            const checked = selectedOptionIds.includes(option.id);
            const name = multiple ? undefined : `question-${question.id}`;
            return (
              <QuizOptionCard
                key={option.id}
                letter={optionLetter(optionIndex)}
                optionText={option.optionText}
                selected={checked}
                disabled={disabled}
                inputType={inputType}
                name={name}
                onSelect={() => onSelect(option.id)}
              />
            );
          })}
        </div>
      </div>
    </fieldset>
  );
}
