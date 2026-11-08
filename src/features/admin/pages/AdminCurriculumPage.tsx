import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumb } from '../../../components/common/Breadcrumb';
import {
  breadcrumbAdminCourse,
  breadcrumbAdminCourses,
  breadcrumbHome,
} from '../../../navigation/breadcrumb-trail';
import { useToast } from '../../../components/feedback/useToast';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  AdminCurriculumSection,
  AdminNewSectionPanel,
} from '../components/AdminCurriculumSection';
import { AdminWorkspaceMeta } from '../components/AdminWorkspaceMeta';
import { DashboardLayout } from '../../dashboard/components/DashboardLayout';
import { DashboardSidebar } from '../../dashboard/components/DashboardSidebar';
import { useAdminCourseDetail } from '../hooks/useAdminCourseDetail';
import { useAdminCurriculum } from '../hooks/useAdminCurriculum';
import { useQuizConfigStatuses } from '../hooks/useQuizConfigStatuses';
import { reorderSections } from '../api/admin-sections.api';
import { useCurriculumItemReorder } from '../hooks/useCurriculumItemReorder';
import { sortBySortOrder } from '../utils/sort-by-sort-order';
import { adminCurriculumSaveMessage } from '../utils/admin-curriculum-messages';

export function AdminCurriculumPage() {
  const { courseId } = useParams();
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const [showNewSection, setShowNewSection] = useState(false);
  const [sectionReordering, setSectionReordering] = useState(false);
  const enabled = Boolean(user?.role === 'ADMIN' && courseId);
  const detail = useAdminCourseDetail(courseId, enabled);
  const curriculum = useAdminCurriculum(courseId, enabled && Boolean(detail.course));
  const quizLessonIds = useMemo(
    () =>
      curriculum.sections?.flatMap((section) =>
        section.lessons.filter((lesson) => lesson.lessonType === 'QUIZ').map((lesson) => lesson.id),
      ) ?? [],
    [curriculum.sections],
  );
  const sortedSections = useMemo(
    () => (curriculum.sections ? sortBySortOrder(curriculum.sections) : []),
    [curriculum.sections],
  );

  const commitSectionOrder = useCallback(
    async (orderedIds: string[]) => {
      if (!accessToken || !courseId) {
        return;
      }
      setSectionReordering(true);
      try {
        await reorderSections(accessToken, courseId, orderedIds);
        await curriculum.refresh();
      } catch (cause: unknown) {
        toast.error(adminCurriculumSaveMessage(cause));
        throw cause;
      } finally {
        setSectionReordering(false);
      }
    },
    [accessToken, courseId, curriculum, toast],
  );

  const sectionReorder = useCurriculumItemReorder(sortedSections, commitSectionOrder);

  const quizConfigStatuses = useQuizConfigStatuses(
    courseId,
    quizLessonIds,
    accessToken,
    enabled && Boolean(curriculum.sections) && !curriculum.loading,
  );

  if (!user) {
    return null;
  }

  const pageLoading = detail.loading || (detail.course && curriculum.loading);

  return (
    <DashboardLayout sidebar={<DashboardSidebar />}>
      <section className="admin-curriculum-page admin-workspace-page" aria-labelledby="admin-curriculum-heading">
        <div className="admin-workspace-top">
        <Breadcrumb
          items={[
            breadcrumbHome(),
            breadcrumbAdminCourses(),
            breadcrumbAdminCourse(courseId ?? '', detail.course?.title, detail.loading),
            { label: 'Giáo trình' },
          ]}
        />
        <AdminWorkspaceMeta user={user} />
        </div>

        {pageLoading ? <p className="page-status">Đang tải chương trình học…</p> : null}

        {!detail.loading && detail.notFound ? (
          <div className="empty-state">
            <p className="empty-state-title">Không tìm thấy khóa học</p>
            <p className="muted">Liên kết có thể không đúng hoặc bạn không có quyền xem.</p>
            <Link to="/admin/courses">Quay lại danh sách</Link>
          </div>
        ) : null}

        {!detail.loading && detail.error ? (
          <div className="section-error" role="alert">
            <p>{detail.error}</p>
            <button type="button" onClick={detail.reload}>
              Thử lại
            </button>
          </div>
        ) : null}

        {detail.course && !detail.notFound ? (
          <>
            <header className="admin-curriculum-header admin-page-header">
              <h1 id="admin-curriculum-heading">Chương trình: {detail.course.title}</h1>
              <Link className="admin-btn admin-btn-secondary" to={`/admin/courses/${detail.course.id}`}>
                Sửa thông tin khóa học
              </Link>
            </header>
            <p className="muted admin-curriculum-integrity-note">
              Chỉ thêm và chỉnh sửa chương, bài học qua giao diện này. Xóa chương hoặc bài học không
              được hỗ trợ trên API hiện tại; tiến độ học và cấu hình quiz vẫn do hệ thống quản lý phía
              máy chủ.
            </p>

            {!curriculum.loading && curriculum.error ? (
              <div className="section-error" role="alert">
                <p>{curriculum.error}</p>
                <button type="button" onClick={curriculum.reload}>
                  Thử lại
                </button>
              </div>
            ) : null}

            {!pageLoading && !curriculum.error && accessToken && courseId ? (
              <>
                <AdminNewSectionPanel
                  courseId={courseId}
                  accessToken={accessToken}
                  open={showNewSection}
                  onOpen={() => setShowNewSection(true)}
                  onClose={() => setShowNewSection(false)}
                  onRefresh={curriculum.refresh}
                  onToastSuccess={(message) => toast.success(message)}
                  onToastError={(message) => toast.error(message)}
                />

                {curriculum.sections?.length === 0 ? (
                  <div className="empty-state admin-curriculum-empty">
                    <p className="empty-state-title">Chưa có chương nào</p>
                    <p className="muted">Thêm chương đầu tiên để bắt đầu xây chương trình.</p>
                  </div>
                ) : null}

                <div className="admin-curriculum-sections">
                  {sortedSections.map((section, index) => (
                    <AdminCurriculumSection
                      key={section.id}
                      courseId={courseId}
                      accessToken={accessToken}
                      section={section}
                      lessons={section.lessons}
                      quizConfigStatuses={quizConfigStatuses}
                      onRefresh={curriculum.refresh}
                      onToastSuccess={(message) => toast.success(message)}
                      onToastError={(message) => toast.error(message)}
                      sectionPosition={index + 1}
                      sectionCount={sortedSections.length}
                      sectionDragOver={sectionReorder.dragOverId === section.id}
                      sectionReorderBusy={sectionReordering}
                      onMoveSection={(direction) => sectionReorder.moveItem(section.id, direction)}
                      sectionDragHandle={{
                        onDragStart: sectionReorder.onDragStart(section.id),
                        onKeyDown: (event) => {
                          if (event.key === 'ArrowUp') {
                            event.preventDefault();
                            void sectionReorder.moveItem(section.id, 'up');
                          } else if (event.key === 'ArrowDown') {
                            event.preventDefault();
                            void sectionReorder.moveItem(section.id, 'down');
                          }
                        },
                      }}
                      onSectionDragOver={sectionReorder.onDragOver(section.id)}
                      onSectionDragLeave={sectionReorder.onDragLeave}
                      onSectionDrop={sectionReorder.onDrop(section.id)}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </>
        ) : null}
      </section>
    </DashboardLayout>
  );
}
