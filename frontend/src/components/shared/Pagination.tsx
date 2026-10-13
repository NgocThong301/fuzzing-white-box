import { Link, useLocation } from 'react-router-dom';
import type { PaginationMeta } from '@/types';

interface PaginationProps {
  meta: PaginationMeta;
  basePath?: string;
}

export function Pagination({ meta, basePath }: PaginationProps) {
  const location = useLocation();
  const path = basePath || location.pathname;

  const { page, totalPages, hasNext, hasPrev } = meta;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5;
    
    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const buildUrl = (newPage: number) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('page', String(newPage));
    return `${path}?${searchParams.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-2 mt-8">
      {/* Previous */}
      {hasPrev ? (
        <Link
          to={buildUrl(page - 1)}
          className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      ) : (
        <span className="px-3 py-2 rounded-lg border border-gray-200 text-gray-300 cursor-not-allowed">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </span>
      )}

      {/* Page numbers */}
      {getPageNumbers().map((p, i) =>
        typeof p === 'number' ? (
          <Link
            key={i}
            to={buildUrl(p)}
            className={`px-4 py-2 rounded-lg border ${
              p === page
                ? 'bg-primary-600 text-white border-primary-600'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {p}
          </Link>
        ) : (
          <span key={i} className="px-2 py-2 text-gray-400">
            {p}
          </span>
        )
      )}

      {/* Next */}
      {hasNext ? (
        <Link
          to={buildUrl(page + 1)}
          className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <span className="px-3 py-2 rounded-lg border border-gray-200 text-gray-300 cursor-not-allowed">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </nav>
  );
}

// Alternative pagination with controlled currentPage
interface ControlledPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ControlledPagination({ currentPage, totalPages, onPageChange }: ControlledPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-4 py-2 rounded-lg border ${
            p === currentPage
              ? 'bg-primary-600 text-white border-primary-600'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}
