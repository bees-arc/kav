import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://www.happybirthdaykaawya.site/sitemap.xml',
    host: 'https://www.happybirthdaykaawya.site',
  };
}
