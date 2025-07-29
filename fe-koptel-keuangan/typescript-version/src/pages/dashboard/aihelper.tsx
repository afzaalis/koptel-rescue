import type { NextPage } from 'next';
import { ReactNode } from 'react';
import UserLayout from 'src/layouts/UserLayout';

import AiHelperChat from 'src/views/dashboard/AiHelper';
type NextPageWithAuth = NextPage & {
  authGuard?: boolean;
  getLayout?: (page: ReactNode) => ReactNode;
}

const AiHelperPage: NextPageWithAuth = () => {
  return <AiHelperChat />;
}

AiHelperPage.authGuard = true;
AiHelperPage.getLayout = (page: ReactNode) => <UserLayout>{page}</UserLayout>;

export default AiHelperPage;
