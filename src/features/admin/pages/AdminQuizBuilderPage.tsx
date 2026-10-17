import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Breadcrumb } from '../../../components/common/Breadcrumb';
import {
  breadcrumbAdminCourse,
  breadcrumbAdminCourses,
  breadcrumbHome,
} from '../../../navigation/breadcrumb-trail';
import { useToast } from '../../../components/feedback/useToast';
import { ApiError } from '../../../services/api/api-error';
import { useAuth } from '../../auth/hooks/useAuth';
import { upsertQuiz } from '../api/admin-quiz.api';
import { AdminQuizBuilderForm } from '../components/AdminQuizBuilderForm';
import { AdminWorkspaceMeta } from '../components/AdminWorkspaceMeta';
import { DashboardLayout } from '../../dashboard/components/DashboardLayout';
import { DashboardSidebar } from '../../dashboard/components/DashboardSidebar';
import { useAdminCourseDetail } from '../hooks/useAdminCourseDetail';
import { useAdminCurriculum } from '../hooks/useAdminCurriculum';
import { useAdminQuizBuilder } from '../hooks/useAdminQuizBuilder';
import {
  ADMIN_QUIZ_ATTEMPTS_LOCKED_MESSAGE,
  ADMIN_QUIZ_SAVE_SUCCESS,
  adminQuizSaveMessage,
} from '../utils/admin-quiz-messages';
import {
  formValuesToUpsertPayload,
  type QuizBuilderFormValues,
} from '../validation/admin-quiz-form.validation';

export function AdminQuizBuilderPage() {
  const { courseId, lessonId } = useParams();
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const enabled = Boolean(user?.role === 'ADMIN' && courseId && lessonId);
  const detail = useAdminCourseDetail(courseId, enabled);
  const curriculum = useAdminCurriculum(courseId, enabled && Boolean(detail.course));
  const load = useAdminQuizBuilder(courseId, lessonId, accessToken, enabled);
  const [questionsLocked, setQuestionsLocked] = useState(false);
  const [attemptsBanner, setAttemptsBanner] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inFlightRef = useRef(false);
  const [formKey, setFormKey] = useState(0);

  const lessonTitle =
    curriculum.sections
      ?.flatMap((section) => section.lessons)
      .find((lesson) => lesson.id === lessonId)?.title ?? lessonId;

  if (!user) {
    return null;
  }

  async function handleSubmit(values: QuizBuilderFormValues) {
    if (!accessToken || !courseId || !lessonId || submitting || inFlightRef.current) {
      return;
    }
    inFlightRef.current = true;
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = formValuesToUpsertPayload(values, !questionsLocked);
      await upsertQuiz(accessToken, courseId, lessonId, payload);
      toast.success(ADMIN_QUIZ_SAVE_SUCCESS);
      setAttemptsBanner(null);
      load.reload();
      setFormKey((current) => current + 1);
    } catch (cause: unknown) {
      if (cause instanceof ApiError && cause.status === 409) {
        setQuestionsLocked(true);
        setAttemptsBanner(ADMIN_QUIZ_ATTEMPTS_LOCKED_MESSAGE);
        setFormError(null);
        return;
      }
      setFormError(adminQuizSaveMessage(cause));
    } finally {
      setSubmitting(false);
      inFlightRef.current = false;
    }
  }

  const pageLoading = detail.loading || curriculum.loading || load.loading;

  return (
    <DashboardLayout sidebar={<DashboardSidebar />}>
      <section className="admin-quiz-builder-page admin-workspace-page" aria-labelledby="admin-quiz-heading">
        <div className="admin-workspace-top">
        <Breadcrumb
          items={[
            breadcrumbHome(),
            breadcrumbAdminCourses(),
            breadcrumbAdminCourse(courseId ?? '', detail.course?.title, detail.loading),
            ...(courseId
              ? [{ label: 'Giáo trình', href: `/admin/courses/${courseId}/curriculum` }]
              : []),
            { label: lessonTitle ? `Quiz: ${lessonTitle}` : 'Cấu hình quiz' },
          ]}
        />
        <AdminWorkspaceMeta user={user} />
        </div>

        <h1 id="admin-quiz-heading">Cấu hình quiz: {lessonTitle}</h1>
        {load.notProvisioned && !load.loading ? (
          <p className="muted">Chưa có quiz — tạo cấu hình bên dưới.</p>
        ) : null}
        {load.quiz?.finalAssessment ? (
          <p className="admin-quiz-final-badge">Quiz đánh giá cuối khóa</p>
        ) : null}

        {pageLoading ? <p className="page-status">Đang tải…</p> : null}

        {!pageLoading && load.error ? (
          <div className="section-error" role="alert">
            <p>{load.error}</p>
            <button type="button" onClick={load.reload}>
              Thử lại
            </button>
          </div>
        ) : null}

        {!pageLoading && !load.error ? (
          <AdminQuizBuilderForm
            key={`${lessonId}-${load.quiz?.quizId ?? 'new'}-${formKey}`}
            initialValues={load.initialForm}
            questionsLocked={questionsLocked}
            formError={formError}
            attemptsLockedBanner={attemptsBanner}
            submitting={submitting}
            onSubmit={handleSubmit}
          />
        ) : null}
      </section>
    </DashboardLayout>
  );
}
