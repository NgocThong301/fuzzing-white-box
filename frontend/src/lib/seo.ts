/**
 * SEO-Friendly URL Slug Utilities
 * 
 * Converts text to URL-friendly slugs
 * Vietnamese diacritics support
 */

export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Vietnamese characters
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/[đ]/g, 'd')
    // Replace spaces and special chars
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function fromSlug(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// URL Patterns
export const SEO_URLS = {
  HOME: '/',
  SEARCH: '/tim-kiem',
  
  // Books/Listings
  BOOKS: '/sach',
  BOOK_DETAIL: (slug: string) => `/sach/${slug}`,
  
  // Categories
  CATEGORIES: '/danh-muc',
  CATEGORY: (slug: string) => `/danh-muc/${slug}`,
  
  // Courses
  COURSES: '/hoc-phan',
  COURSE: (slug: string) => `/hoc-phan/${slug}`,
  
  // Universities
  UNIVERSITIES: '/truong',
  UNIVERSITY: (slug: string) => `/truong/${slug}`,
  
  // Majors
  MAJORS: '/nganh',
  MAJOR: (slug: string) => `/nganh/${slug}`,
  
  // Auth
  LOGIN: '/dang-nhap',
  REGISTER: '/dang-ky',
  
  // User
  CART: '/gio-hang',
  CHECKOUT: '/thanh-toan',
  ORDERS: '/don-hang',
  ORDER_DETAIL: (id: number) => `/don-hang/${id}`,
  
  // Seller
  SELLER_ORDERS: '/nguoi-ban/don-hang',
  MY_LISTINGS: '/nguoi-ban/tin-dang',
  CREATE_LISTING: '/nguoi-ban/tao-tin',
  
  // Admin
  ADMIN: '/admin',
  
  // Static pages
  ABOUT: '/ve-chung-toi',
  CONTACT: '/lien-he',
  FAQ: '/cau-hoi-thuong-gap',
  PRIVACY: '/chinh-sach-bao-mat',
  TERMS: '/dieu-khoan-su-dung',
};

// Generate canonical URLs
export function getCanonicalUrl(path: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}${path}`;
}

// Generate og:image URL
export function getOgImageUrl(imagePath: string): string {
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  return `${window.location.origin}${imagePath}`;
}

// URL Validation
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

// Extract ID from slug (for database lookups)
// Format: id-slug -> extract 123 from "123-lap-trinh-web"
export function extractIdFromSlug(slug: string): number | null {
  const parts = slug.split('-');
  const id = parseInt(parts[0], 10);
  return isNaN(id) ? null : id;
}

// Create SEO-friendly slug from ID and title
export function createSlug(id: number, title: string): string {
  const slug = toSlug(title);
  return `${id}-${slug}`;
}
