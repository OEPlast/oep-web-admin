import { redirect } from 'next/navigation';
import { routes } from '@/config/routes';

// There is no read-only product view in the admin; product links land on the
// edit page, which loads the product by its id.
export default async function ProductDetailsRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(routes.eCommerce.ediProduct(slug));
}
