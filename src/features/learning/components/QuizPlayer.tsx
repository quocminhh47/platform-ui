import { useQuizPlayer } from '../hooks/useQuizPlayer';
import { formatAttemptsQuotaVi } from '../utils/quizAttemptQuota';
import { QuizCountdown } from './QuizCountdown';
import { QuizQuestionCard } from './QuizQuestionCard';
import { QuizResultPanel } from './QuizResultPanel';

type QuizPlayerProps = {
  courseId: string;
  lessonId: string;
};

export function QuizPlayer({ courseId, lessonId }: QuizPlayerProps) {
  const player = useQuizPlayer({
    courseId,
    lessonId,
    enabled: Boolean(courseId && lessonId),
  });

  if (player.phase === 'loading') {
    return <p className="page-status">Đang tải bài trắc nghiệm…</p>;
  }

  if (player.phase === 'idle') {
    return (
      <div className="quiz-player quiz-player-idle">
        <p className="muted">Bạn chưa bắt đầu hoặc có thể làm lượt mới.</p>
        <button type="button" className="button-primary" onClick={() => void player.startAttempt()}>
          Bắt đầu làm bài
        </button>
      </div>
    );
  }

  if (player.phase === 'error') {
    return (
      <div className="section-error" role="alert">
        <p>{player.loadError}</p>
        <button type="button" onClick={player.reload}>
          Thử lại
        </button>
      </div>
    );
  }

  if (player.phase === 'result' && player.result) {
    const quotaLabel = formatAttemptsQuotaVi(
      player.result.attemptsUsed,
      player.result.maxAttempts,
    );
    return (
      <div className="quiz-player">
        <p className="muted quiz-player-meta">{quotaLabel}</p>
        <QuizResultPanel result={player.result} take={player.take} />
        {player.retakeError ? (
          <p className="form-error" role="alert">
            {player.retakeError}
          </p>
        ) : null}
        {player.canRetake ? (
          <div className="quiz-actions">
            <button type="button" className="button-primary" onClick={() => void player.startAttempt()}>
              Làm lại
            </button>
          </div>
        ) : (
          <p className="muted">Bạn đã dùng hết số lần làm bài cho phép.</p>
        )}
      </div>
    );
  }

  if (!player.take) {
    return null;
  }

  const { take } = player;
  const disabled = player.phase === 'submitting' || player.expiredLocally;

  return (
    <div className="quiz-player">
      <div className="quiz-player-meta">
        <p className="muted">
          Ngưỡng đạt: {take.passingScore}% · {formatAttemptsQuotaVi(take.attemptsUsed, take.maxAttempts)}
        </p>
        {take.expiresAt && player.remainingSeconds != null ? (
          <QuizCountdown
            remainingSeconds={player.remainingSeconds}
            expired={player.expiredLocally}
          />
        ) : null}
      </div>

      {player.validationError ? (
        <p className="form-error" role="alert">
          {player.validationError}
        </p>
      ) : null}
      {player.submitError ? (
        <p className="form-error" role="alert">
          {player.submitError}
        </p>
      ) : null}

      <form
        className="quiz-form"
        onSubmit={(event) => {
          event.preventDefault();
          void player.submit();
        }}
      >
        {take.questions.map((question, index) => (
          <QuizQuestionCard
            key={question.id}
            index={index}
            question={question}
            selectedOptionIds={player.answers[question.id] ?? []}
            disabled={disabled}
            onSelect={(optionId) =>
              player.selectOption(question.id, optionId, question.questionType === 'MULTIPLE_CHOICE')
            }
          />
        ))}

        <div className="quiz-actions">
          {player.expiredLocally ? (
            player.canRetake ? (
              <button type="button" className="button-primary" onClick={() => void player.startAttempt()}>
                Bắt đầu lượt mới
              </button>
            ) : (
              <p className="muted">Bạn đã dùng hết số lần làm bài cho phép.</p>
            )
          ) : (
            <button type="submit" className="button-primary" disabled={disabled}>
              {player.phase === 'submitting' ? 'Đang nộp bài…' : 'Nộp bài'}
            </button>
          )}
        </div>
      </form>

    </div>
  );
}
