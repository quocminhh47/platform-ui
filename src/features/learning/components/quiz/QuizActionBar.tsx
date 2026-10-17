type QuizActionBarProps = {
  expiredLocally: boolean;
  submitting: boolean;
  disabled: boolean;
  canRetake: boolean;
  onRetake: () => void;
};

export function QuizActionBar({
  expiredLocally,
  submitting,
  disabled,
  canRetake,
  onRetake,
}: QuizActionBarProps) {
  if (expiredLocally) {
    return (
      <div className="quiz-action-bar">
        {canRetake ? (
          <button type="button" className="quiz-btn quiz-btn-primary" onClick={onRetake}>
            Bắt đầu lượt mới
          </button>
        ) : (
          <p className="quiz-action-muted">Bạn đã dùng hết số lần làm bài cho phép.</p>
        )}
      </div>
    );
  }

  return (
    <div className="quiz-action-bar">
      <button
        type="submit"
        className="quiz-btn quiz-btn-primary quiz-btn-submit"
        disabled={disabled}
      >
        {submitting ? 'Đang nộp bài…' : 'Nộp bài'}
      </button>
    </div>
  );
}
