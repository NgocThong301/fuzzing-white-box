import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { categoryApi } from '@/lib/api';
import { CategoryCard, LoadingSpinner, EmptyState } from '@/components/shared';

export function CategoriesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: () => categoryApi.getTree(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">
            Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">📚 Danh mục sách</h1>

        {!data || data.length === 0 ? (
          <EmptyState
            title="Chưa có danh mục nào"
            description="Danh mục sách sẽ được cập nhật sớm nhất."
            icon="📚"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((category) => (
              <div key={category.id} className="space-y-2">
                <CategoryCard category={category} />
                {category.children && category.children.length > 0 && (
                  <div className="ml-4 grid grid-cols-2 gap-2">
                    {category.children.map((child) => (
                      <Link
                        key={child.id}
                        to={`/search?categoryId=${child.id}`}
                        className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
