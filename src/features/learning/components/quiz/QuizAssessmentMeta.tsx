import { formatAttemptsQuotaVi } from '../../utils/quizAttemptQuota';
import { QuizCountdown } from '../QuizCountdown';

type QuizAssessmentMetaProps = {
  passingScore: number;
  attemptsUsed: number;
  maxAttempts: number | null;
  remainingSeconds: number | null;
  expiredLocally: boolean;
  showTimer: boolean;
};

export function QuizAssessmentMeta({
  passingScore,
  attemptsUsed,
  maxAttempts,
  remainingSeconds,
  expiredLocally,
  showTimer,
}: QuizAssessmentMetaProps) {
  return (
    <div className="quiz-assessment-meta">
      <div className="quiz-assessment-pills">
        <div className="quiz-assessment-pill quiz-assessment-pill-primary">
          <span className="quiz-assessment-pill-label">Ngưỡng đạt:</span>
          <strong className="quiz-tabular">{passingScore}%</strong>
        </div>
        <div className="quiz-assessment-pill">
          <span className="quiz-assessment-pill-label">
            {formatAttemptsQuotaVi(attemptsUsed, maxAttempts)}
          </span>
        </div>
        <span className="quiz-assessment-status">
          <span className="quiz-assessment-status-dot" aria-hidden="true" />
          Đang làm bài
        </span>
      </div>
      {showTimer && remainingSeconds != null ? (
        <QuizCountdown remainingSeconds={remainingSeconds} expired={expiredLocally} />
      ) : null}
    </div>
  );
}
