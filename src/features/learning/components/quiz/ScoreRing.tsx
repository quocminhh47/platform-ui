type ScoreRingProps = {
  score: number;
  passed: boolean;
};

export function ScoreRing({ score, passed }: ScoreRingProps) {
  const radius = 68;
  const stroke = 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const clamped = Math.min(100, Math.max(0, score));
  const offset = circumference - (clamped / 100) * circumference;
  const tone = passed ? 'pass' : 'fail';

  return (
    <div className={`quiz-score-ring quiz-score-ring-${tone}`} role="img" aria-label={`Điểm ${score}%`}>
      <svg width={radius * 2} height={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
        <circle
          className="quiz-score-ring-track"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          className="quiz-score-ring-fill"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          transform={`rotate(-90 ${radius} ${radius})`}
        />
      </svg>
      <div className="quiz-score-ring-center">
        <span className="quiz-score-ring-value quiz-tabular">{score}%</span>
        <span className="quiz-score-ring-badge">{passed ? 'Đạt' : 'Cần ôn tập'}</span>
      </div>
    </div>
  );
}
