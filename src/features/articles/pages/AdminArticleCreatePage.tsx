import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../dashboard/components/DashboardLayout';
import { DashboardSidebar } from '../../dashboard/components/DashboardSidebar';
import { ArticleCreatePage } from './ArticleCreatePage';

export function AdminArticleCreatePage() {
  return <DashboardLayout sidebar={<DashboardSidebar />}>
    <Link to="/admin/articles">Quay lại quản lý bài viết</Link>
    <ArticleCreatePage />
  </DashboardLayout>;
}
