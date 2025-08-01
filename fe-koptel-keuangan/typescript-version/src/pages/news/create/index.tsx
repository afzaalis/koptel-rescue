// import type { NextPage } from 'next';
// import { ReactNode } from 'react';
// import UserLayout from 'src/layouts/UserLayout';
// import CreateNews from 'src/views/news/create';

// type NextPageWithAuth = NextPage & {
//   authGuard?: boolean;
//   getLayout?: (page: ReactNode) => ReactNode;
// }

// const CreateNews: NextPageWithAuth = () => {
//   return <CreateNews />;
// }

// CreateNews.authGuard = true;
// CreateNews.getLayout = (page: ReactNode) => <UserLayout>{page}</UserLayout>;

// export default CreateNews;


import CreateNews from "src/views/news/create";

export default CreateNews;
