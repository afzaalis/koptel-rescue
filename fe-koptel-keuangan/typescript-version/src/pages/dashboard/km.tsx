import type { NextPage } from 'next';
import { ReactNode } from 'react';
import UserLayout from 'src/layouts/UserLayout'; 
import KMDashboard from 'src/views/dashboard/km';

type NextPageWithAuth = NextPage & {
  authGuard?: boolean;
  getLayout?: (page: ReactNode) => ReactNode;
}

const KMPage: NextPageWithAuth = () => {
  return <KMDashboard />;
}

KMPage.authGuard = true;
KMPage.getLayout = (page: ReactNode) => <UserLayout>{page}</UserLayout>;

export default KMPage;
