import { metaObject } from '@/config/site.config';
import { routes } from '@/config/routes';
import PageHeaderWithNavigation from '@/app/shared/page-header-w-nav';
import FeatureGate from '@/components/FeatureGate';
import { RouteGuard } from '@/components/RouteGuard';
import { PermissionAction, PermissionResource } from '@/hooks/queries/usePermissions';
import ArticlesList from '@/app/shared/content/articles/articles-list';

export const metadata = {
  ...metaObject('Articles'),
};

const pageHeader = {
  title: 'Articles',
  breadcrumb: [{ name: 'Storefront content' }, { href: routes.content.articles, name: 'Articles' }, { name: 'All' }],
};

export default function ArticlesPage() {
  return (
    <FeatureGate feature="content">
      <PageHeaderWithNavigation
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
        href={routes.content.createArticle}
        buttonText="New article"
      />
      <RouteGuard resources={[PermissionResource.CONTENT]} action={PermissionAction.READ}>
        <ArticlesList />
      </RouteGuard>
    </FeatureGate>
  );
}
