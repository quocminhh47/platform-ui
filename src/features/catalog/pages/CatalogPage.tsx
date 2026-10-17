import { Breadcrumb } from '../../../components/common/Breadcrumb';
import { breadcrumbCourses, breadcrumbHome } from '../../../navigation/breadcrumb-trail';
import { CourseBrowser } from '../components/CourseBrowser';

export function CatalogPage() {
  return (
    <div className="landing-page landing-catalog-page">
      <header className="landing-catalog-hero">
        <div className="landing-container">
          <Breadcrumb items={[breadcrumbHome(), breadcrumbCourses()]} />
          <h1>Danh mục khóa học</h1>
          <p className="muted">
            Khóa học tiếng Trung và luyện thi HSK đã xuất bản trên nền tảng.
          </p>
        </div>
      </header>
      <CourseBrowser heading="Kho học liệu tiếng Trung & luyện thi HSK" variant="landing" />
    </div>
  );
}
