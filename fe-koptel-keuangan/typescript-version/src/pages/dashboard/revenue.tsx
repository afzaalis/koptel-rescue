import type { NextPage } from 'next';
import { ReactNode } from 'react';
import UserLayout from 'src/layouts/UserLayout'; 
import RevenueDashboard from 'src/views/dashboard/Revenue';

type NextPageWithAuth = NextPage & {
  authGuard?: boolean;
  getLayout?: (page: ReactNode) => ReactNode;
}

const RevenuePage: NextPageWithAuth = () => {
  return <RevenueDashboard />;
}

RevenuePage.authGuard = true;

RevenuePage.getLayout = (page: ReactNode) => <UserLayout>{page}</UserLayout>;

export default RevenuePage;
