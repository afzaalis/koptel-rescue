import type { NextPage } from 'next';
import { ReactNode } from 'react';
import UserLayout from 'src/layouts/UserLayout';
import CollectionDashboard from 'src/views/dashboard/Collection';

type NextPageWithAuth = NextPage & {
  authGuard?: boolean;
  getLayout?: (page: ReactNode) => ReactNode;
}

const CollectionPage: NextPageWithAuth = () => {
  return <CollectionDashboard />;
}

CollectionPage.authGuard = true;
CollectionPage.getLayout = (page: ReactNode) => <UserLayout>{page}</UserLayout>;

export default CollectionPage;
