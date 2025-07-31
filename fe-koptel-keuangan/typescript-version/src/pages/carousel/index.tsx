import type { NextPage } from 'next';
import { ReactNode } from 'react';
import UserLayout from 'src/layouts/UserLayout';
import CarouselDashboard from 'src/views/carousel/carousel';

type NextPageWithAuth = NextPage & {
  authGuard?: boolean;
  getLayout?: (page: ReactNode) => ReactNode;
}

const CarouselPage: NextPageWithAuth = () => {
  return <CarouselDashboard />;
}

CarouselPage.authGuard = true;
CarouselPage.getLayout = (page: ReactNode) => <UserLayout>{page}</UserLayout>;

export default CarouselPage;
