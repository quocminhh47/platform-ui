import { useQuizPlayer } from '../hooks/useQuizPlayer';
import { formatAttemptsQuotaVi } from '../utils/quizAttemptQuota';
import { QuizActionBar } from './quiz/QuizActionBar';
import { QuizAssessmentMeta } from './quiz/QuizAssessmentMeta';
import { QuizProgress } from './quiz/QuizProgress';
import { QuizQuestionCard } from './QuizQuestionCard';
import { QuizResultPanel } from './QuizResultPanel';

type QuizPlayerProps = {
  courseId: string;
  lessonId: string;
  lessonTitle?: string;
  onQuizPassed?: () => void;
};

function countAnsweredQuestions(
  questionIds: string[],
  answers: Record<string, string[]>,
): number {
  return questionIds.filter((id) => (answers[id]?.length ?? 0) > 0).length;
}

export function QuizPlayer({
  courseId,
  lessonId,
  lessonTitle,
  onQuizPassed,
}: QuizPlayerProps) {
  const player = useQuizPlayer({
    courseId,
    lessonId,
    enabled: Boolean(courseId && lessonId),
    onQuizPassed,
  });

  if (player.phase === 'loading') {
    return <p className="page-status quiz-assessment-loading">Đang tải bài trắc nghiệm…</p>;
  }

  if (player.phase === 'idle') {
    return (
      <div className="quiz-assessment quiz-assessment-idle">
        <p className="quiz-assessment-idle-text">Bạn chưa bắt đầu hoặc có thể làm lượt mới.</p>
        <button
          type="button"
          className="quiz-btn quiz-btn-primary"
          onClick={() => void player.startAttempt()}
        >
          Bắt đầu làm bài
        </button>
      </div>
    );
  }

  if (player.phase === 'error') {
    return (
      <div className="quiz-assessment quiz-assessment-error section-error" role="alert">
        <p>{player.loadError}</p>
        <button type="button" className="quiz-btn quiz-btn-secondary" onClick={player.reload}>
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
      <div className="quiz-assessment quiz-assessment-result">
        <p className="quiz-result-quota muted">{quotaLabel}</p>
        <QuizResultPanel result={player.result} take={player.take} />
        {player.retakeError ? (
          <p className="form-error" role="alert">
            {player.retakeError}
          </p>
        ) : null}
        {player.canRetake ? (
          <div className="quiz-action-bar">
            <button
              type="button"
              className="quiz-btn quiz-btn-primary"
              onClick={() => void player.startAttempt()}
            >
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
  const answeredCount = countAnsweredQuestions(
    take.questions.map((question) => question.id),
    player.answers,
  );

  return (
    <div className="quiz-assessment">
      {lessonTitle ? (
        <header className="quiz-assessment-intro">
          <h2 className="quiz-assessment-title">{lessonTitle}</h2>
          <p className="quiz-assessment-subtitle">Bài kiểm tra trắc nghiệm</p>
        </header>
      ) : null}

      <QuizAssessmentMeta
        passingScore={take.passingScore}
        attemptsUsed={take.attemptsUsed}
        maxAttempts={take.maxAttempts}
        remainingSeconds={player.remainingSeconds}
        expiredLocally={player.expiredLocally}
        showTimer={Boolean(take.expiresAt && player.remainingSeconds != null)}
      />

      <QuizProgress answeredCount={answeredCount} totalQuestions={take.questions.length} />

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
        className="quiz-assessment-form"
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

        <QuizActionBar
          expiredLocally={player.expiredLocally}
          submitting={player.phase === 'submitting'}
          disabled={disabled}
          canRetake={player.canRetake}
          onRetake={() => void player.startAttempt()}
        />
      </form>
    </div>
  );
}
