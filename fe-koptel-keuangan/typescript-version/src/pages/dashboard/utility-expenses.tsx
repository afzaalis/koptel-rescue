import type { NextPage } from 'next';
import { ReactNode } from 'react';
import UserLayout from 'src/layouts/UserLayout';
import UtilityExpensesDashboard from 'src/views/dashboard/UtilityExpenses';

type NextPageWithAuth = NextPage & {
  authGuard?: boolean;
  getLayout?: (page: ReactNode) => ReactNode;
}

const UtilityExpensesPage: NextPageWithAuth = () => {
  return <UtilityExpensesDashboard />;
}

UtilityExpensesPage.authGuard = true;

UtilityExpensesPage.getLayout = (page: ReactNode) => <UserLayout>{page}</UserLayout>;

export default UtilityExpensesPage;
