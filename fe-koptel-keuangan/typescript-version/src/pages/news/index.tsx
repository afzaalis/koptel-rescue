import type { NextPage } from 'next';
import { ReactNode } from 'react';
import UserLayout from 'src/layouts/UserLayout';
import NewsList from 'src/views/news';

type NextPageWithAuth = NextPage & {
  authGuard?: boolean;
  getLayout?: (page: ReactNode) => ReactNode;
}

const NewsPage: NextPageWithAuth = () => {
  return <NewsList />;
}

NewsPage.authGuard = true;
NewsPage.getLayout = (page: ReactNode) => <UserLayout>{page}</UserLayout>;

export default NewsPage;
