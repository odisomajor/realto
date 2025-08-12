import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const baseUrl = 'https://xillix.co.ke';

  try {
    // Static pages
    const staticPages = [
      '',
      '/properties',
      '/properties/for-sale',
      '/properties/for-rent',
      '/properties/land',
      '/properties/commercial',
      '/properties/warehouses',
      '/properties/advanced-search',
      '/properties/mortgage-calculator',
      '/properties/insights',
      '/agents',
      '/dashboard',
      '/favorites',
      '/auth/login',
      '/auth/register',
      '/recommendations'
    ];

    // Fetch properties from API
    let properties: any[] = [];
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/properties`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        properties = Array.isArray(data.properties) ? data.properties : 
                    Array.isArray(data) ? data : [];
      }
    } catch (error) {
      console.error('Error fetching properties for sitemap:', error);
      properties = []; // Ensure it's always an array
    }

    // Ensure properties is always an array before using .map()
    if (!Array.isArray(properties)) {
      properties = [];
    }

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
            xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
            xmlns:xhtml="http://www.w3.org/1999/xhtml"
            xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
            xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
            xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
      ${staticPages
        .map(
          (page) => `
        <url>
          <loc>${baseUrl}${page}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <changefreq>${page === '' ? 'daily' : page.includes('properties') ? 'hourly' : 'weekly'}</changefreq>
          <priority>${page === '' ? '1.0' : page.includes('properties') ? '0.9' : '0.8'}</priority>
        </url>`
        )
        .join('')}
      ${properties
        .map(
          (property: any) => `
        <url>
          <loc>${baseUrl}/properties/${property.id}</loc>
          <lastmod>${property.updatedAt || property.createdAt || new Date().toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.7</priority>
          ${property.images && typeof property.images === 'string' && property.images.trim() ? 
            property.images.split(' ').filter(Boolean).map((image: string) => `
          <image:image>
            <image:loc>${image}</image:loc>
            <image:title>${property.title}</image:title>
            <image:caption>${property.description || property.title}</image:caption>
          </image:image>`).join('') : ''
          }
        </url>`
        )
        .join('')}
    </urlset>`;

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}