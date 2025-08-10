import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const baseUrl = 'https://xillix.co.ke';
  
  const robotsTxt = `User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /dashboard/
Disallow: /api/
Disallow: /auth/
Disallow: /_next/
Disallow: /admin/

# Allow specific auth pages for SEO
Allow: /auth/login
Allow: /auth/register

# Crawl delay
Crawl-delay: 1

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Additional sitemaps
Sitemap: ${baseUrl}/api/sitemap

# Google specific
User-agent: Googlebot
Allow: /
Crawl-delay: 1

# Bing specific
User-agent: Bingbot
Allow: /
Crawl-delay: 1

# Block bad bots
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /`;

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}