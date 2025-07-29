import type { NextPage } from 'next';
import { ReactNode } from 'react';
import UserLayout from 'src/layouts/UserLayout'; 

import BudgetCodeManagement from 'src/views/dashboard/master-data/BudgetCodeManagement';

type NextPageWithAuth = NextPage & {
  authGuard?: boolean;
  getLayout?: (page: ReactNode) => ReactNode;
  acl?: {
    action: string;
    subject: string;
  };
}

// Terapkan tipe NextPageWithAuth pada komponen halaman ini
const MasterDataPage: NextPageWithAuth = () => {
  return <BudgetCodeManagement />;
}

MasterDataPage.authGuard = true;
// Anda bisa menambahkan ACL di sini jika Anda memiliki sistem ACL
// MasterDataPage.acl = {
//   action: 'read', // Contoh: hanya role tertentu yang bisa melihat halaman ini
//   subject: 'master-data'
// };

// Jika halaman ini menggunakan layout tertentu
MasterDataPage.getLayout = (page: ReactNode) => <UserLayout>{page}</UserLayout>;

export default MasterDataPage;
