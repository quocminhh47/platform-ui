import { createBrowserRouter } from 'react-router-dom';
import { AccountPage } from '../features/account/pages/AccountPage';
import { AppShell } from '../components/layout/AppShell';
import { MemberChromeLayout } from '../components/layout/MemberChromeLayout';
import { GuestRoute } from '../features/auth/components/GuestRoute';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { CatalogPage } from '../features/catalog/pages/CatalogPage';
import { CourseDetailPage } from '../features/catalog/pages/CourseDetailPage';
import { AdminRoute } from '../features/admin/components/AdminRoute';
import { AdminCourseFormPage } from '../features/admin/pages/AdminCourseFormPage';
import { AdminDashboardPage } from '../features/admin/pages/AdminDashboardPage';
import { AdminCourseListPage } from '../features/admin/pages/AdminCourseListPage';
import { AdminUserListPage } from '../features/admin/pages/AdminUserListPage';
import { AdminCurriculumPage } from '../features/admin/pages/AdminCurriculumPage';
import { AdminQuizBuilderPage } from '../features/admin/pages/AdminQuizBuilderPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { MyCoursesPage } from '../features/enrollment/pages/MyCoursesPage';
import { LearningWorkspacePage } from '../features/learning/pages/LearningWorkspacePage';
import { ArticleCreatePage } from '../features/articles/pages/ArticleCreatePage';
import { ArticleDetailPage } from '../features/articles/pages/ArticleDetailPage';
import { ArticleEditPage } from '../features/articles/pages/ArticleEditPage';
import { ArticleListPage } from '../features/articles/pages/ArticleListPage';
import { MyArticlesPage } from '../features/articles/pages/MyArticlesPage';
import { HomePage } from '../pages/HomePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'courses', element: <CatalogPage /> },
      { path: 'courses/:courseId', element: <CourseDetailPage /> },
      { path: 'articles', element: <ArticleListPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'articles/create', element: <ArticleCreatePage /> },
          { path: 'articles/edit/:id', element: <ArticleEditPage /> },
        ],
      },
      { path: 'articles/:slug', element: <ArticleDetailPage /> },
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
          { path: 'courses/:courseId/learn/:lessonId?', element: <LearningWorkspacePage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MemberChromeLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/account', element: <AccountPage /> },
          { path: '/my-courses', element: <MyCoursesPage /> },
          { path: '/my-articles', element: <MyArticlesPage /> },
          {
            element: <AdminRoute />,
            children: [
              { path: '/admin', element: <AdminDashboardPage /> },
              { path: '/admin/users', element: <AdminUserListPage /> },
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
    ],
  },
]);
