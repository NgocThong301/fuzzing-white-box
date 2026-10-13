/**
 * SITEMAP CONTROLLER
 * ==================
 * 
 * Generates dynamic sitemap.xml for SEO
 */

import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/common/prisma/prisma.service';

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'D'))
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

@Controller('sitemap')
export class SitemapController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('xml')
  async generateSitemap(@Res() res: Response) {
    const baseUrl = process.env.FRONTEND_URL || 'https://www.sachgiare.vn';
    const today = new Date().toISOString().split('T')[0];

    // Fetch all publishable content
    const [categories, courses, universities, books] = await Promise.all([
      // Categories
      this.prisma.category.findMany({
        where: { books: { some: {} } },
        select: { id: true, name: true, updatedAt: true },
      }),
      
      // Courses
      this.prisma.course.findMany({
        where: { books: { some: {} } },
        select: { id: true, name: true, updatedAt: true },
      }),
      
      // Universities
      this.prisma.university.findMany({
        select: { id: true, name: true, updatedAt: true },
      }),
      
      // Books with listings (using title as name)
      this.prisma.book.findMany({
        where: {
          listings: {
            some: {
              status: 'APPROVED',
              quantity: { gt: 0 },
            },
          },
        },
        select: { 
          id: true, 
          title: true, 
          updatedAt: true,
          listings: {
            where: { status: 'APPROVED', quantity: { gt: 0 } },
            take: 1,
            select: { images: true },
          },
        },
      }),
    ]);

    const urls: SitemapUrl[] = [
      // Static pages
      { loc: baseUrl, priority: '1.0', changefreq: 'daily' },
      { loc: `${baseUrl}/sach`, priority: '0.9', changefreq: 'daily' },
      { loc: `${baseUrl}/danh-muc`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${baseUrl}/hoc-phan`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${baseUrl}/truong`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${baseUrl}/nganh`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${baseUrl}/tim-kiem`, priority: '0.7', changefreq: 'weekly' },
      { loc: `${baseUrl}/dang-nhap`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${baseUrl}/dang-ky`, priority: '0.5', changefreq: 'monthly' },
    ];

    // Add categories
    categories.forEach(cat => {
      urls.push({
        loc: `${baseUrl}/danh-muc/${generateSlug(cat.name)}`,
        lastmod: cat.updatedAt.toISOString().split('T')[0],
        priority: '0.7',
        changefreq: 'weekly',
      });
    });

    // Add courses
    courses.forEach(course => {
      urls.push({
        loc: `${baseUrl}/hoc-phan/${generateSlug(course.name)}`,
        lastmod: course.updatedAt.toISOString().split('T')[0],
        priority: '0.7',
        changefreq: 'weekly',
      });
    });

    // Add universities
    universities.forEach(uni => {
      urls.push({
        loc: `${baseUrl}/truong/${generateSlug(uni.name)}`,
        lastmod: uni.updatedAt.toISOString().split('T')[0],
        priority: '0.7',
        changefreq: 'weekly',
      });
    });

    // Add books/listings
    books.forEach(book => {
      if (book.listings.length > 0) {
        urls.push({
          loc: `${baseUrl}/sach/${book.id}-${generateSlug(book.title)}`,
          lastmod: book.updatedAt.toISOString().split('T')[0],
          priority: '0.6',
          changefreq: 'daily',
        });
      }
    });

    const sitemap = generateSitemapXml(urls, today);

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'max-age=3600, public');
    res.send(sitemap);
  }
}

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
  images?: string[];
}

function generateSitemapXml(urls: SitemapUrl[], today: string): string {
  const urlEntries = urls.map(url => {
    const imageEntries = url.images?.map(img => 
      `    <image:image>
      <image:loc>${escapeXml(img)}</image:loc>
    </image:image>`
    ).join('\n') || '';

    return `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod || today}</lastmod>
    <changefreq>${url.changefreq || 'weekly'}</changefreq>
    <priority>${url.priority || '0.5'}</priority>
    ${imageEntries}
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries}
</urlset>`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
