type QuizOptionCardProps = {
  letter: string;
  optionText: string;
  selected: boolean;
  disabled: boolean;
  inputType: 'radio' | 'checkbox';
  name?: string;
  onSelect: () => void;
};

export function QuizOptionCard({
  letter,
  optionText,
  selected,
  disabled,
  inputType,
  name,
  onSelect,
}: QuizOptionCardProps) {
  return (
    <label
      className={
        selected
          ? 'quiz-option-card is-selected'
          : 'quiz-option-card'
      }
    >
      <span className="quiz-option-card-body">
        <span className="quiz-option-card-badge" aria-hidden="true">
          {letter}
        </span>
        <span className="quiz-option-card-text">{optionText}</span>
      </span>
      {selected ? (
        <span className="quiz-option-card-check" aria-hidden="true">
          ✓
        </span>
      ) : null}
      <input
        className="quiz-option-card-input"
        type={inputType}
        name={name}
        checked={selected}
        disabled={disabled}
        aria-label={optionText}
        onChange={onSelect}
      />
    </label>
  );
}
