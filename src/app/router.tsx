import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { GuestRoute } from '../features/auth/components/GuestRoute';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { CatalogPage } from '../features/catalog/pages/CatalogPage';
import { CourseDetailPage } from '../features/catalog/pages/CourseDetailPage';
import { AdminRoute } from '../features/admin/components/AdminRoute';
import { AdminCourseFormPage } from '../features/admin/pages/AdminCourseFormPage';
import { AdminCourseListPage } from '../features/admin/pages/AdminCourseListPage';
import { AdminCurriculumPage } from '../features/admin/pages/AdminCurriculumPage';
import { AdminQuizBuilderPage } from '../features/admin/pages/AdminQuizBuilderPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { MyCoursesPage } from '../features/enrollment/pages/MyCoursesPage';
import { LearningWorkspacePage } from '../features/learning/pages/LearningWorkspacePage';
import { HomePage } from '../pages/HomePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'courses', element: <CatalogPage /> },
      { path: 'courses/:courseId', element: <CourseDetailPage /> },
      {
        element: <GuestRoute />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'account', element: <HomePage /> },
          { path: 'courses/:courseId/learn/:lessonId?', element: <LearningWorkspacePage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/my-courses', element: <MyCoursesPage /> },
      {
        element: <AdminRoute />,
        children: [
          { path: '/admin/courses', element: <AdminCourseListPage /> },
          { path: '/admin/courses/new', element: <AdminCourseFormPage /> },
          { path: '/admin/courses/:courseId/curriculum', element: <AdminCurriculumPage /> },
          {
            path: '/admin/courses/:courseId/lessons/:lessonId/quiz',
            element: <AdminQuizBuilderPage />,
          },
          { path: '/admin/courses/:courseId', element: <AdminCourseFormPage /> },
        ],
      },
    ],
  },
]);
