import { Outlet } from 'react-router-dom';
import { SiteChromeLayout } from './SiteChromeLayout';

export function PublicLayout() {
  return (
    <SiteChromeLayout>
      <Outlet />
    </SiteChromeLayout>
  );
}
