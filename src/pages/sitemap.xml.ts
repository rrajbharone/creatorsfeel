import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const blogPosts = await getCollection('blog');
  const origin = context.url.origin;

  const staticPages = [
    '',
    '/tools',
    '/tools/instagram-engagement-calculator',
    '/tools/influencer-rate-calculator',
    '/tools/youtube-title-length-checker',
    '/tools/cpm-calculator',
    '/tools/instagram-bio-character-counter',
    '/tools/instagram-caption-character-counter',
    '/tools/linkedin-headline-generator',
    '/tools/cost-per-engagement-calculator',
    '/tools/instagram-story-reel-calculator',
    '/tools/brand-deal-calculator',
    '/tools/linkedin-bio-generator',
    '/tools/brand-collaboration-roi-calculator',
    '/tools/ugc-pricing-calculator',
    '/tools/amazon-affiliate-calculator',
    '/tools/instagram-money-calculator',
    '/tools/content-creator-rate-calculator',
    '/tools/youtube-tag-generator',
    '/tools/youtube-timestamp-generator',
    '/tools/youtube-rpm-calculator',
    '/tools/twitter-engagement-calculator',
    '/tools/instagram-username-generator',
    '/tools/instagram-hashtag-counter',
    '/tools/linkedin-post-formatter',
    '/blog',
    '/privacy',
    '/terms',
    '/disclaimer',
    '/about',
    '/contact'
  ];

  const sitemapItems = [
    ...staticPages.map(page => `${origin}${page}`),
    ...blogPosts.map(post => `${origin}/blog/${post.id}`)
  ];

  const today = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapItems.map(url => `
  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url === origin || url === `${origin}/` ? '1.0' : '0.8'}</priority>
  </url>`).join('').trim()}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
