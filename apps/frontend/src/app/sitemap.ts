import { websiteUrl } from '@gitroom/frontend/components/website/website.company';
import { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/privacy', '/terms', '/data-deletion', '/contact'].map(
    (path) => ({
      url: `${websiteUrl()}${path}`,
      changeFrequency: 'monthly',
      priority: path ? 0.5 : 1,
    })
  );
}
