import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../services/api/api-error';
import { getQuiz } from '../api/admin-quiz.api';
import type { QuizAdmin } from '../types/admin-quiz.types';
import { adminQuizLoadMessage } from '../utils/admin-quiz-messages';
import {
  emptyQuizBuilderForm,
  quizAdminToFormValues,
  type QuizBuilderFormValues,
} from '../validation/admin-quiz-form.validation';

export type AdminQuizBuilderLoadState = {
  loading: boolean;
  notProvisioned: boolean;
  error: string | null;
  quiz: QuizAdmin | null;
  initialForm: QuizBuilderFormValues;
  reload: () => void;
};

export function useAdminQuizBuilder(
  courseId: string | undefined,
  lessonId: string | undefined,
  accessToken: string | null,
  enabled: boolean,
): AdminQuizBuilderLoadState {
  const [loading, setLoading] = useState(enabled && Boolean(courseId && lessonId));
  const [notProvisioned, setNotProvisioned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuizAdmin | null>(null);
  const [initialForm, setInitialForm] = useState<QuizBuilderFormValues>(emptyQuizBuilderForm());
  const [requestId, setRequestId] = useState(0);

  const reload = useCallback(() => {
    setRequestId((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !courseId || !lessonId || !accessToken) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);
    setNotProvisioned(false);
    setQuiz(null);

    getQuiz(accessToken, courseId, lessonId)
      .then((result) => {
        if (!active) {
          return;
        }
        setQuiz(result);
        setInitialForm(quizAdminToFormValues(result));
        setNotProvisioned(false);
      })
      .catch((cause: unknown) => {
        if (!active) {
          return;
        }
        if (cause instanceof ApiError && cause.status === 404) {
          setQuiz(null);
          setInitialForm(emptyQuizBuilderForm());
          setNotProvisioned(true);
          setError(null);
          return;
        }
        setQuiz(null);
        setError(adminQuizLoadMessage(cause));
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [courseId, lessonId, accessToken, enabled, requestId]);

  return { loading, notProvisioned, error, quiz, initialForm, reload };
}
