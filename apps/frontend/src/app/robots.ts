import { websiteUrl } from '@gitroom/frontend/components/website/website.company';
import { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/privacy', '/terms', '/data-deletion', '/contact'],
      disallow: ['/p/', '/api/', '/auth/', '/launches', '/settings'],
    },
    sitemap: `${websiteUrl()}/sitemap.xml`,
  };
}
