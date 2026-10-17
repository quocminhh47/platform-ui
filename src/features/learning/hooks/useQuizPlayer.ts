import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../../../services/api/api-error';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  getQuizSession,
  startOrResumeQuizAttempt,
  submitQuizAttempt,
} from '../api/quiz-attempts.api';
import type {
  QuizAttemptResultResponse,
  QuizAttemptTakeResponse,
} from '../types/quiz.types';
import {
  buildSubmitPayload,
  toggleMultipleAnswer,
  toggleSingleAnswer,
  validateAnswersForSubmit,
  type AnswerMap,
} from '../utils/quizAnswers';
import {
  quizAttemptLoadMessage,
  quizAttemptQuotaMessage,
  quizAttemptSubmitMessage,
} from '../utils/quizAttemptMessages';
import { canStartAnotherAttempt } from '../utils/quizAttemptQuota';
import { isQuizTakeResponse, takeSnapshotFromResult } from '../utils/quizSession';
import { createQuizClockSync, remainingMs } from '../utils/quizTimer';

export type QuizPlayerPhase =
  | 'loading'
  | 'idle'
  | 'take'
  | 'submitting'
  | 'result'
  | 'error';

export type UseQuizPlayerState = {
  phase: QuizPlayerPhase;
  take: QuizAttemptTakeResponse | null;
  result: QuizAttemptResultResponse | null;
  answers: AnswerMap;
  loadError: string | null;
  submitError: string | null;
  validationError: string | null;
  expiredLocally: boolean;
  remainingSeconds: number | null;
  canRetake: boolean;
  retakeError: string | null;
  reload: () => void;
  startAttempt: () => Promise<void>;
  submit: () => Promise<void>;
  selectOption: (questionId: string, optionId: string, multiple: boolean) => void;
};

type UseQuizPlayerOptions = {
  courseId: string;
  lessonId: string;
  enabled: boolean;
  onQuizPassed?: () => void;
};

export function useQuizPlayer({
  courseId,
  lessonId,
  enabled,
  onQuizPassed,
}: UseQuizPlayerOptions): UseQuizPlayerState {
  const { accessToken } = useAuth();
  const [phase, setPhase] = useState<QuizPlayerPhase>('loading');
  const [take, setTake] = useState<QuizAttemptTakeResponse | null>(null);
  const [result, setResult] = useState<QuizAttemptResultResponse | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [retakeError, setRetakeError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);
  const [tick, setTick] = useState(0);

  const clock = useMemo(
    () => (take?.status === 'IN_PROGRESS' ? createQuizClockSync(take.serverNow) : null),
    [take?.serverNow, take?.status],
  );

  const remainingSeconds = useMemo(() => {
    if (!take?.expiresAt || !clock || take.status !== 'IN_PROGRESS') {
      return null;
    }
    void tick;
    return Math.ceil(remainingMs(take.expiresAt, clock) / 1000);
  }, [take?.expiresAt, take?.status, clock, tick]);

  const expiredLocally =
    take?.status === 'IN_PROGRESS' &&
    take.expiresAt != null &&
    remainingSeconds !== null &&
    remainingSeconds <= 0;

  const reload = useCallback(() => {
    setPhase('loading');
    setTake(null);
    setResult(null);
    setAnswers({});
    setLoadError(null);
    setSubmitError(null);
    setValidationError(null);
    setRetakeError(null);
    setRequestId((current) => current + 1);
  }, []);

  const applySession = useCallback(
    (payload: QuizAttemptTakeResponse | QuizAttemptResultResponse) => {
      setRetakeError(null);
      if (isQuizTakeResponse(payload)) {
        setTake(payload);
        setResult(null);
        setPhase('take');
        return;
      }
      setResult(payload);
      setTake(takeSnapshotFromResult(payload));
      setPhase('result');
    },
    [],
  );

  const quotaSource = useMemo(() => {
    if (result) {
      return { attemptsUsed: result.attemptsUsed, maxAttempts: result.maxAttempts };
    }
    if (take) {
      return { attemptsUsed: take.attemptsUsed, maxAttempts: take.maxAttempts };
    }
    return null;
  }, [result, take]);

  const canRetake = quotaSource
    ? canStartAnotherAttempt(quotaSource.attemptsUsed, quotaSource.maxAttempts)
    : true;

  useEffect(() => {
    if (!enabled || !accessToken) {
      return;
    }

    let active = true;

    getQuizSession(courseId, lessonId, accessToken)
      .then((response) => {
        if (!active) {
          return;
        }
        applySession(response);
      })
      .catch((cause: unknown) => {
        if (!active) {
          return;
        }
        if (cause instanceof ApiError && cause.status === 404) {
          setPhase('idle');
          setLoadError(null);
          return;
        }
        setLoadError(quizAttemptLoadMessage(cause));
        setPhase('error');
      });

    return () => {
      active = false;
    };
  }, [enabled, accessToken, courseId, lessonId, requestId, applySession]);

  useEffect(() => {
    if (!take?.expiresAt || phase !== 'take' || take.status !== 'IN_PROGRESS') {
      return;
    }
    const timer = window.setInterval(() => {
      setTick((current) => current + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [take?.expiresAt, phase, take?.attemptId, take?.status]);

  const startAttempt = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    setRetakeError(null);
    const previousPhase = phase;
    const previousResult = result;
    setPhase('loading');
    setLoadError(null);
    try {
      const response = await startOrResumeQuizAttempt(courseId, lessonId, accessToken);
      setTake(response);
      setResult(null);
      setAnswers({});
      setPhase('take');
    } catch (cause: unknown) {
      if (
        cause instanceof ApiError &&
        cause.status === 409 &&
        previousPhase === 'result' &&
        previousResult
      ) {
        setResult(previousResult);
        setTake(takeSnapshotFromResult(previousResult));
        setRetakeError(quizAttemptQuotaMessage(cause));
        setPhase('result');
        return;
      }
      setLoadError(quizAttemptLoadMessage(cause));
      setPhase('error');
    }
  }, [accessToken, courseId, lessonId, phase, result]);

  const selectOption = useCallback(
    (questionId: string, optionId: string, multiple: boolean) => {
      setValidationError(null);
      setAnswers((current) =>
        multiple
          ? toggleMultipleAnswer(current, questionId, optionId)
          : toggleSingleAnswer(current, questionId, optionId),
      );
    },
    [],
  );

  const submit = useCallback(async () => {
    if (!take || !accessToken || expiredLocally) {
      return;
    }
    const validation = validateAnswersForSubmit(take.questions, answers);
    if (validation) {
      setValidationError(validation);
      return;
    }
    setValidationError(null);
    setSubmitError(null);
    setPhase('submitting');

    try {
      const payload = buildSubmitPayload(take.questions, answers);
      const response = await submitQuizAttempt(
        courseId,
        lessonId,
        take.attemptId,
        payload,
        accessToken,
      );
      const mergedResult: QuizAttemptResultResponse = {
        ...response,
        maxAttempts: response.maxAttempts ?? take.maxAttempts,
        attemptsUsed: response.attemptsUsed ?? take.attemptsUsed,
        questions: response.questions ?? take.questions,
      };
      setResult(mergedResult);
      setTake(takeSnapshotFromResult(mergedResult) ?? take);
      setPhase('result');
      if (mergedResult.passed) {
        onQuizPassed?.();
      }
    } catch (cause: unknown) {
      setSubmitError(quizAttemptSubmitMessage(cause));
      setPhase('take');
      if (cause instanceof ApiError && cause.status === 409) {
        const expired = cause.message.toLowerCase().includes('expired');
        if (expired) {
          setTake(null);
          setPhase('error');
          setLoadError(quizAttemptSubmitMessage(cause));
        }
      }
    }
  }, [take, accessToken, expiredLocally, answers, courseId, lessonId, onQuizPassed]);

  return {
    phase,
    take,
    result,
    answers,
    loadError,
    submitError,
    validationError,
    expiredLocally,
    remainingSeconds,
    canRetake,
    retakeError,
    reload,
    startAttempt,
    submit,
    selectOption,
  };
}
