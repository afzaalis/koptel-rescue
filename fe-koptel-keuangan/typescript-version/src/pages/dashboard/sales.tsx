import Sales from 'src/views/dashboard/Sales'
import type { NextPage } from 'next';
import { ReactNode } from 'react';

type NextPageWithAuth = NextPage & {
  authGuard?: boolean;
  getLayout?: (page: ReactNode) => ReactNode; 
}

const SalesPage: NextPageWithAuth = Sales;

SalesPage.authGuard = true;

export default SalesPage;
