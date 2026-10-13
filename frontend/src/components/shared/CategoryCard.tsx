import { Link } from 'react-router-dom';
import type { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      to={`/search?categoryId=${category.id}`}
      className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all"
    >
      <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center text-2xl group-hover:bg-primary-200 transition-colors">
        📚
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
            {category.description}
          </p>
        )}
      </div>
      {category._count?.books !== undefined && (
        <span className="text-sm text-gray-400 shrink-0">
          {category._count.books} sách
        </span>
      )}
    </Link>
  );
}
