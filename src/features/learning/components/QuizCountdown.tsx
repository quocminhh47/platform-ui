import { formatCountdownVi } from '../utils/quizTimer';

type QuizCountdownProps = {
  remainingSeconds: number;
  expired: boolean;
};

export function QuizCountdown({ remainingSeconds, expired }: QuizCountdownProps) {
  if (expired) {
    return (
      <p className="quiz-countdown quiz-countdown-expired" role="status">
        Hết thời gian làm bài
      </p>
    );
  }

  const urgent = remainingSeconds <= 60;
  return (
    <p
      className={urgent ? 'quiz-countdown quiz-countdown-urgent' : 'quiz-countdown'}
      role="timer"
      aria-live="polite"
    >
      Thời gian còn lại: {formatCountdownVi(remainingSeconds)}
    </p>
  );
}
