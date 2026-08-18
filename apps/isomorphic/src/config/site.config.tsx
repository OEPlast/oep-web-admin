import { Metadata } from 'next';
import { LAYOUT_OPTIONS } from '@/config/enums';
import { OpenGraph } from 'next/dist/lib/metadata/types/opengraph-types';

enum MODE {
  DARK = 'dark',
  LIGHT = 'light',
}

/**
 * Env-var fallback, not a hardcoded literal — matches `NEXT_PUBLIC_STORE_NAME` used by
 * storefront. `metaObject()` below is called synchronously by ~90 page files as a static
 * `export const metadata = metaObject(...)`, so it can't become async without converting every
 * one of those to `generateMetadata()`; the live, Settings-fetched name is used instead in the
 * places that already do per-request rendering (signin/auth pages — see their own files).
 */
export const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || 'Rawura';
export const ADMIN_NAME = `${STORE_NAME} Admin`;

export const siteConfig = {
  title: `${ADMIN_NAME} - Manage your store`,
  description: `${ADMIN_NAME}.`,
  logo: '/images/brand/logoTransparent.png',
  icon: '/images/brand/logoMiniLight.png',
  mode: MODE.LIGHT,
  layout: LAYOUT_OPTIONS.HYDROGEN,
  // TODO: favicon
};

export const metaObject = (
  title?: string,
  openGraph?: OpenGraph,
  description: string = siteConfig.description
): Metadata => {
  return {
    title: title ? `${title} - ${ADMIN_NAME}` : siteConfig.title,
    description,
    openGraph: openGraph ?? {
      title: title ? `${title} - ${ADMIN_NAME}` : title,
      description,
      url:
        process.env.NEXT_PUBLIC_SITE_URL ||
        'https://isomorphic-furyroad.vercel.app',
      siteName: ADMIN_NAME, // https://developers.google.com/search/docs/appearance/site-names
      images: {
        url: '/opengraph-thumb.png',
        width: 1200,
        height: 630,
      },
      locale: 'en_US',
      type: 'website',
    },
  };
};
