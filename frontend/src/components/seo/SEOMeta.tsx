/**
 * SEO Component
 * 
 * Handles:
 * - Dynamic title
 * - Meta description
 * - Canonical URL
 * - Open Graph
 * - Twitter Card
 * - Structured Data (JSON-LD)
 * - Breadcrumbs
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOMeta {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'product' | 'article' | 'book';
  structuredData?: any;
  breadcrumbs?: BreadcrumbItem[];
  price?: number;
  currency?: string;
  author?: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

const DEFAULT_META = {
  title: 'SachGiaRe.vn - Mua Bán Sách Giáo Trình Giá Rẻ',
  description: 'Nền tảng mua bán sách giáo trình, tài liệu học tập uy tín. Giá tốt nhất, giao hàng nhanh chóng, đa dạng đại học và môn học.',
  image: '/og-image.jpg',
  siteName: 'SachGiaRe.vn',
  locale: 'vi_VN',
};

// Slug generation utility
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'D'))
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function getBookUrl(slug: string): string {
  return `/sach/${slug}`;
}

export function getCategoryUrl(slug: string): string {
  return `/danh-muc/${slug}`;
}

export function getCourseUrl(slug: string): string {
  return `/hoc-phan/${slug}`;
}

export function getUniversityUrl(slug: string): string {
  return `/truong/${slug}`;
}

export function getMajorUrl(slug: string): string {
  return `/nganh/${slug}`;
}

export default function SEOMeta({
  title,
  description,
  keywords,
  canonical,
  image,
  type = 'website',
  structuredData,
  breadcrumbs,
  price,
  currency = 'VND',
  author,
}: SEOMeta) {
  const location = useLocation();
  const fullUrl = `${window.location.origin}${canonical || location.pathname}`;
  const metaTitle = title ? `${title} | SachGiaRe.vn` : DEFAULT_META.title;
  const metaDescription = description || DEFAULT_META.description;
  const metaImage = image || `${window.location.origin}${DEFAULT_META.image}`;

  useEffect(() => {
    // Update document title
    document.title = metaTitle;

    // Update meta tags
    const updateMetaTag = (property: string, content: string, isProperty = true) => {
      const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement | null;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', property);
        } else {
          meta.setAttribute('name', property);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta
    updateMetaTag('description', metaDescription, false);
    if (keywords) {
      updateMetaTag('keywords', keywords, false);
    }

    // Open Graph
    updateMetaTag('og:title', metaTitle);
    updateMetaTag('og:description', metaDescription);
    updateMetaTag('og:image', metaImage);
    updateMetaTag('og:url', fullUrl);
    updateMetaTag('og:type', type);
    updateMetaTag('og:site_name', DEFAULT_META.siteName);
    updateMetaTag('og:locale', DEFAULT_META.locale);

    // Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', metaTitle);
    updateMetaTag('twitter:description', metaDescription);
    updateMetaTag('twitter:image', metaImage);
    updateMetaTag('twitter:site', '@SachGiaRe');

    // Product specific
    if (type === 'product' && price) {
      updateMetaTag('og:price:amount', price.toString());
      updateMetaTag('og:price:currency', currency);
    }

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = fullUrl;

    // Structured Data - Organization
    let orgSchema = document.getElementById('schema-organization');
    if (!orgSchema) {
      orgSchema = document.createElement('script');
      orgSchema.id = 'schema-organization';
      (orgSchema as HTMLScriptElement).type = 'application/ld+json';
      document.head.appendChild(orgSchema);
    }
    orgSchema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'SachGiaRe.vn',
      url: window.location.origin,
      logo: `${window.location.origin}/logo.png`,
      sameAs: [
        'https://www.facebook.com/SachGiaRe',
        'https://www.instagram.com/sachgiare',
      ],
    });

    // Breadcrumb Schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      let breadcrumbSchema = document.getElementById('schema-breadcrumb');
      if (!breadcrumbSchema) {
        breadcrumbSchema = document.createElement('script');
        breadcrumbSchema.id = 'schema-breadcrumb';
        (breadcrumbSchema as HTMLScriptElement).type = 'application/ld+json';
        document.head.appendChild(breadcrumbSchema);
      }
      
      const breadcrumbItems = breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${window.location.origin}${item.url}`,
      }));

      breadcrumbSchema.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems,
      });
    }

    // Custom structured data
    if (structuredData) {
      let customSchema = document.getElementById('schema-custom');
      if (!customSchema) {
        customSchema = document.createElement('script');
        customSchema.id = 'schema-custom';
        (customSchema as HTMLScriptElement).type = 'application/ld+json';
        document.head.appendChild(customSchema);
      }
      customSchema.textContent = JSON.stringify(structuredData);
    } else {
      // Remove custom schema if no data
      const customSchema = document.getElementById('schema-custom');
      if (customSchema) {
        customSchema.remove();
      }
    }

    // Remove breadcrumb schema if no breadcrumbs
    if (!breadcrumbs || breadcrumbs.length === 0) {
      const breadcrumbSchema = document.getElementById('schema-breadcrumb');
      if (breadcrumbSchema) {
        breadcrumbSchema.remove();
      }
    }

  }, [title, description, keywords, canonical, image, type, fullUrl, metaTitle, metaDescription, metaImage, breadcrumbs, structuredData, price, currency, author]);

  return null;
}

// Product/Book structured data generator
export function generateProductSchema({
  name,
  description,
  image,
  price,
  currency = 'VND',
  author,
  isbn,
  publisher,
  url,
}: {
  name: string;
  description: string;
  image?: string;
  price: number;
  currency?: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  url?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: image ? [image] : undefined,
    url: url || window.location.href,
    sku: isbn,
    isbn,
    brand: {
      '@type': 'Brand',
      name: publisher || 'N/A',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: currency,
      price: price,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'SachGiaRe.vn',
      },
    },
    ...(author && {
      manufacturer: {
        '@type': 'Organization',
        name: author,
      },
    }),
  };
}

// Book specific structured data
export function generateBookSchema({
  name,
  description,
  image,
  price,
  author,
  isbn,
  publisher,
  url,
}: {
  name: string;
  description: string;
  image?: string;
  price: number;
  author?: string;
  isbn?: string;
  publisher?: string;
  url?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name,
    description,
    image: image ? [image] : undefined,
    url: url || window.location.href,
    isbn,
    ...(author && {
      author: {
        '@type': 'Person',
        name: author,
      },
    }),
    publisher: {
      '@type': 'Organization',
      name: publisher || 'N/A',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'VND',
      price: price,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'SachGiaRe.vn',
      },
    },
  };
}

// Course structured data
export function generateCourseSchema({
  name,
  description,
  image,
  provider,
  url,
}: {
  name: string;
  description: string;
  image?: string;
  provider?: string;
  url?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    image: image ? [image] : undefined,
    url: url || window.location.href,
    provider: {
      '@type': 'Organization',
      name: provider || 'SachGiaRe.vn',
    },
  };
}

// WebSite structured data with search
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SachGiaRe.vn',
    url: window.location.origin,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${window.location.origin}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
