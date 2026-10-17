import { formatCountdownVi } from '../utils/quizTimer';

type QuizCountdownProps = {
  remainingSeconds: number;
  expired: boolean;
};

function timerTone(remainingSeconds: number): 'normal' | 'warning' | 'critical' {
  if (remainingSeconds <= 30) {
    return 'critical';
  }
  if (remainingSeconds <= 120) {
    return 'warning';
  }
  return 'normal';
}

export function QuizCountdown({ remainingSeconds, expired }: QuizCountdownProps) {
  if (expired) {
    return (
      <p className="quiz-timer quiz-timer-critical quiz-timer-expired" role="status">
        Hết thời gian làm bài
      </p>
    );
  }

  const tone = timerTone(remainingSeconds);
  return (
    <p
      className={`quiz-timer quiz-timer-${tone}`}
      role="timer"
      aria-live="polite"
    >
      <span className="quiz-timer-icon" aria-hidden="true">⏱</span>
      <span>
        Thời gian còn lại:{' '}
        <span className="quiz-timer-value quiz-tabular">
          {formatCountdownVi(remainingSeconds)}
        </span>
      </span>
    </p>
  );
}
