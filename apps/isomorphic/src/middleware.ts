import { pagesOptions } from '@/app/api/auth/[...nextauth]/pages-options';
import withAuth from 'next-auth/middleware';

export default withAuth({
  pages: {
    ...pagesOptions,
  },
});

export const config = {
  // restricted routes
  matcher: [
    '/',
    '/ecommerce/:path*',
    '/inventory/:path*',
    '/transactions/:path*',
    '/users/:path*',
    '/roles-permissions/:path*',
    '/store-settings/:path*',
    '/analytics/:path*',
    '/marketing/:path*',
    '/invoice/:path*',
  ],
};
