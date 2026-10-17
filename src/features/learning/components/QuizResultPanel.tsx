import type {
  QuizAttemptResultResponse,
  QuizAttemptTakeResponse,
} from '../types/quiz.types';
import { ScoreRing } from './quiz/ScoreRing';

type QuizResultPanelProps = {
  result: QuizAttemptResultResponse;
  take: QuizAttemptTakeResponse | null;
};

export function QuizResultPanel({ result, take }: QuizResultPanelProps) {
  const questionById = new Map(
    (take?.questions ?? result.questions ?? []).map((question) => [question.id, question]),
  );

  return (
    <section className="quiz-result-panel" aria-live="polite">
      <h2 className="quiz-result-heading">Kết quả bài trắc nghiệm</h2>
      <div className="quiz-result-summary">
        <ScoreRing score={result.score} passed={result.passed} />
        <div className="quiz-result-summary-text">
          <p
            className={
              result.passed ? 'quiz-result-status quiz-result-status-pass' : 'quiz-result-status quiz-result-status-fail'
            }
          >
            {result.passed ? 'Đạt' : 'Chưa đạt'}
          </p>
          <p className="quiz-result-requirement">
            Yêu cầu: <span className="quiz-tabular">{result.passingScore}%</span>
          </p>
          {result.bestScore != null ? (
            <p className="quiz-result-meta">
              Điểm cao nhất: <span className="quiz-tabular">{result.bestScore}%</span>
              {result.bestPassed ? ' (đã đạt)' : ''}
            </p>
          ) : null}
          {result.finalAssessment ? (
            <p className="quiz-result-meta">Bài đánh giá cuối khóa</p>
          ) : null}
        </div>
      </div>

      <ol className="quiz-result-answers">
        {result.answers.map((answer, index) => {
          const question = questionById.get(answer.questionId);
          const labels = answer.selectedOptionIds
            .map((optionId) => question?.options.find((option) => option.id === optionId)?.optionText)
            .filter(Boolean);
          return (
            <li key={answer.questionId} className="quiz-result-answer-item">
              <strong>Câu {index + 1}.</strong>{' '}
              {question?.questionText ?? 'Câu hỏi'}
              <div className="quiz-result-selection">
                Lựa chọn của bạn: {labels.length > 0 ? labels.join(', ') : '—'}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
