import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { universityApi } from '@/lib/api';
import { LoadingSpinner, EmptyState } from '@/components/shared';

export function UniversitiesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['universities'],
    queryFn: () => universityApi.getAll({ limit: 50 }),
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">🏛️ Trường đại học</h1>

        {!data || data.data.length === 0 ? (
          <EmptyState
            title="Chưa có trường đại học nào"
            description="Danh sách trường đại học sẽ được cập nhật sớm nhất."
            icon="🏛️"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.data.map((university) => (
              <Link
                key={university.id}
                to={`/universities/${university.id}`}
                className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md hover:border-primary-200 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-600 shrink-0">
                    {university.shortName?.charAt(0) || university.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors truncate">
                      {university.shortName || university.name}
                    </h3>
                    {university.shortName && (
                      <p className="text-sm text-gray-500 mt-0.5">{university.name}</p>
                    )}
                    {university.address && (
                      <p className="text-sm text-gray-400 mt-2 line-clamp-1">
                        📍 {university.address}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>📚 {university._count?.majors || 0} ngành</span>
                      <span>👥 {university._count?.users || 0} sinh viên</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
