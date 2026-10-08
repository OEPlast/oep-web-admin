import { metaObject } from '@/config/site.config';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import FeatureGate from '@/components/FeatureGate';
import { RouteGuard } from '@/components/RouteGuard';
import { PermissionAction, PermissionResource } from '@/hooks/queries/usePermissions';
import ArticleForm from '@/app/shared/content/articles/article-form';

export const metadata = {
  ...metaObject('New article'),
};

const pageHeader = {
  title: 'New article',
  breadcrumb: [{ name: 'Storefront content' }, { href: routes.content.articles, name: 'Articles' }, { name: 'Create' }],
};

export default function CreateArticlePage() {
  return (
    <FeatureGate feature="content">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <RouteGuard resources={[PermissionResource.CONTENT]} action={PermissionAction.CREATE}>
        <ArticleForm />
      </RouteGuard>
    </FeatureGate>
  );
}
