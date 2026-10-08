import { metaObject } from '@/config/site.config';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import FeatureGate from '@/components/FeatureGate';
import { RouteGuard } from '@/components/RouteGuard';
import { PermissionAction, PermissionResource } from '@/hooks/queries/usePermissions';
import { EditArticle } from '@/app/shared/content/articles/article-form';

export const metadata = {
  ...metaObject('Edit article'),
};

const pageHeader = {
  title: 'Edit article',
  breadcrumb: [{ name: 'Storefront content' }, { href: routes.content.articles, name: 'Articles' }, { name: 'Edit' }],
};

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <FeatureGate feature="content">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <RouteGuard resources={[PermissionResource.CONTENT]} action={PermissionAction.UPDATE}>
        <EditArticle id={id} />
      </RouteGuard>
    </FeatureGate>
  );
}
