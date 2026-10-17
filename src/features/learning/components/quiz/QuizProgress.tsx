type QuizProgressProps = {
  answeredCount: number;
  totalQuestions: number;
};

export function QuizProgress({ answeredCount, totalQuestions }: QuizProgressProps) {
  const percent =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="quiz-progress" aria-label="Tiến trình làm bài">
      <div className="quiz-progress-header">
        <span className="quiz-progress-label">Tiến trình làm bài</span>
        <span className="quiz-progress-stat">
          Đã trả lời:{' '}
          <strong className="quiz-tabular">
            {answeredCount}
          </strong>
          {' / '}
          <strong className="quiz-tabular">{totalQuestions}</strong>
          {' câu '}
          <span className="quiz-tabular">({percent}%)</span>
        </span>
      </div>
      <div
        className="quiz-progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={`${percent}% câu đã trả lời`}
      >
        <div className="quiz-progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
