import { Outlet } from 'react-router-dom';
import { SiteChromeLayout } from './SiteChromeLayout';

/** Site header/footer around learner dashboard, my courses, and admin workspace. */
export function MemberChromeLayout() {
  return (
    <SiteChromeLayout mainClassName="public-main member-chrome-main">
      <Outlet />
    </SiteChromeLayout>
  );
}
