import type {
  QuizAttemptResultResponse,
  QuizAttemptTakeResponse,
} from '../types/quiz.types';

type QuizResultPanelProps = {
  result: QuizAttemptResultResponse;
  take: QuizAttemptTakeResponse | null;
};

export function QuizResultPanel({ result, take }: QuizResultPanelProps) {
  const questionById = new Map(
    (take?.questions ?? result.questions ?? []).map((question) => [question.id, question]),
  );

  return (
    <section className="quiz-result" aria-live="polite">
      <h2 className="quiz-result-heading">Kết quả bài trắc nghiệm</h2>
      <p className={result.passed ? 'quiz-result-badge pass' : 'quiz-result-badge fail'}>
        {result.passed ? 'Đạt' : 'Chưa đạt'} — {result.score}% (Yêu cầu: {result.passingScore}%)
      </p>
      {result.bestScore != null ? (
        <p className="quiz-result-meta">
          Điểm cao nhất: {result.bestScore}% {result.bestPassed ? '(đã đạt)' : ''}
        </p>
      ) : null}
      {result.finalAssessment ? (
        <p className="quiz-result-meta">Bài đánh giá cuối khóa</p>
      ) : null}

      <ol className="quiz-result-answers">
        {result.answers.map((answer, index) => {
          const question = questionById.get(answer.questionId);
          const labels = answer.selectedOptionIds
            .map((optionId) => question?.options.find((option) => option.id === optionId)?.optionText)
            .filter(Boolean);
          return (
            <li key={answer.questionId}>
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
