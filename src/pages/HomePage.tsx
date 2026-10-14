import { CourseBrowser } from '../features/catalog/components/CourseBrowser';
import { HomeHero } from './home/HomeHero';

export function HomePage() {
  return (
    <>
      <HomeHero />
      <CourseBrowser heading="Kho học liệu tiếng Trung & luyện thi HSK" />
    </>
  );
}
