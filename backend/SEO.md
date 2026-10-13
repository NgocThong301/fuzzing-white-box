# SEO Documentation

## Overview

This document outlines the SEO (Search Engine Optimization) strategy and implementation for SachGiaRe.vn.

---

## URL Structure

### Friendly URLs

| Page Type | URL Pattern | Example |
|-----------|------------|---------|
| Home | `/` | `/` |
| Books/Search | `/sach` | `/sach/giao-trinh-lap-trinh-web` |
| Categories | `/danh-muc` | `/danh-muc/sach-giao-trinh` |
| Courses | `/hoc-phan` | `/hoc-phan/lap-trinh-web` |
| Universities | `/truong` | `/truong/phenikaa` |
| Majors | `/nganh` | `/nganh/ky-thuat-phan-mem` |
| Search | `/tim-kiem` | `/tim-kiem?q=lap+trinh` |
| Auth | `/dang-nhap`, `/dang-ky` | `/dang-nhap` |

### URL Rules

1. **No query strings** - Use friendly URLs instead of `/book?id=123`
2. **Hyphen-separated** - `/giao-trinh-lap-trinh-web`
3. **Lowercase** - `/sach-khong-dung-chu-hoa`
4. **Vietnamese-friendly** - Remove diacritics in URLs
5. **Descriptive** - Include keywords naturally

---

## Meta Tags Implementation

### Dynamic Title

```tsx
// Usage
<SEOMeta 
  title="Giáo Trình Lập Trình Web - Sách Cũ Giá Tốt"
  description="Mua bán sách giáo trình Lập Trình Web giá rẻ..."
/>
```

**Output:**
```html
<title>Giáo Trình Lập Trình Web - Sách Cũ Giá Tốt | SachGiaRe.vn</title>
```

### Meta Description

- Length: 150-160 characters
- Include primary keyword
- Clear call-to-action

### Canonical URL

```html
<link rel="canonical" href="https://www.sachgiare.vn/sach/giao-trinh-lap-trinh-web" />
```

---

## Open Graph Tags

```html
<meta property="og:title" content="Giáo Trình Lập Trình Web" />
<meta property="og:description" content="Mua bán sách giáo trình..." />
<meta property="og:image" content="https://www.sachgiare.vn/images/book-123.jpg" />
<meta property="og:url" content="https://www.sachgiare.vn/sach/giao-trinh-lap-trinh-web" />
<meta property="og:type" content="product" />
<meta property="og:site_name" content="SachGiaRe.vn" />
<meta property="og:locale" content="vi_VN" />
```

---

## Twitter Card Tags

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Giáo Trình Lập Trình Web" />
<meta name="twitter:description" content="Mua bán sách giáo trình..." />
<meta name="twitter:image" content="https://www.sachgiare.vn/images/book-123.jpg" />
<meta name="twitter:site" content="@SachGiaRe" />
```

---

## Structured Data (JSON-LD)

### Product Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Giáo Trình Lập Trình Web",
  "description": "Sách giáo trình lập trình web căn bản...",
  "image": "https://www.sachgiare.vn/images/book-123.jpg",
  "sku": "ISBN-978-123-456",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "VND",
    "price": "150000",
    "availability": "https://schema.org/InStock"
  }
}
```

### Book Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Book",
  "name": "Giáo Trình Lập Trình Web",
  "isbn": "978-123-456-789",
  "author": {
    "@type": "Person",
    "name": "Nguyễn Văn A"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Nhà Xuất Bản Giáo Dục"
  }
}
```

### Breadcrumb Schema

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Trang chủ",
      "item": "https://www.sachgiare.vn"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Sách",
      "item": "https://www.sachgiare.vn/sach"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Giáo Trình Lập Trình Web"
    }
  ]
}
```

### WebSite Schema

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "SachGiaRe.vn",
  "url": "https://www.sachgiare.vn",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://www.sachgiare.vn/tim-kiem?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

---

## Sitemap

### Location
- URL: `/api/sitemap/xml` (API endpoint)
- robots.txt reference: `Sitemap: https://www.sachgiare.vn/api/sitemap.xml`

### Priority Levels

| Page Type | Priority | Change Frequency |
|-----------|----------|------------------|
| Home | 1.0 | Daily |
| Category pages | 0.9 | Daily |
| Book listings | 0.8 | Weekly |
| Course pages | 0.7 | Weekly |
| University pages | 0.7 | Weekly |
| Auth pages | 0.5 | Monthly |

---

## robots.txt

```txt
User-agent: *
Allow: /

Disallow: /admin/
Disallow: /api/
Disallow: /thanh-toan
Disallow: /gio-hang
Disallow: /don-hang/
Disallow: /nguoi-ban/
Disallow: /wallet

Sitemap: https://www.sachgiare.vn/api/sitemap.xml
```

---

## SEO Checklist

### On-Page SEO

- [x] Unique title tags
- [x] Meta descriptions
- [x] Canonical URLs
- [x] Open Graph tags
- [x] Twitter Card tags
- [x] Structured data (JSON-LD)
- [x] Breadcrumbs
- [x] Semantic HTML
- [x] Image alt text
- [x] Internal linking

### Technical SEO

- [x] Sitemap.xml
- [x] robots.txt
- [x] SSL/HTTPS
- [x] Fast page load
- [x] Mobile responsive
- [x] Clean URL structure
- [x] Hreflang tags (if multi-language)

### Content SEO

- [x] Original content
- [x] Keyword optimization
- [x] Readable formatting
- [x] Internal linking
- [x] External links

---

## Page-Specific SEO

### Homepage
- Target keywords: "mua bán sách giáo trình", "sách cũ giá rẻ"
- Structured data: Organization, WebSite

### Category Pages
- Target keywords: category name + "sách"
- Structured data: Category, BreadcrumbList

### Book/Product Pages
- Target keywords: book title, author, ISBN
- Structured data: Product, Book, BreadcrumbList, Offer

### Course Pages
- Target keywords: course name + "tài liệu"
- Structured data: Course, BreadcrumbList

### University Pages
- Target keywords: university name + "sách"
- Structured data: CollegeOrUniversity, BreadcrumbList

---

## Performance

### Core Web Vitals Targets

| Metric | Target |
|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |

### Optimization Strategies

1. **Image Optimization**
   - WebP format
   - Lazy loading
   - Responsive images

2. **Code Splitting**
   - React.lazy()
   - Route-based splitting

3. **Caching**
   - Service workers
   - Cache-Control headers

---

## Monitoring

### Google Search Console

- Submit sitemap
- Monitor indexing
- Track keywords
- Check Core Web Vitals

### Analytics

- Google Analytics 4
- Track SEO metrics
- Monitor traffic sources

---

*Last Updated: 2026-09-25*
