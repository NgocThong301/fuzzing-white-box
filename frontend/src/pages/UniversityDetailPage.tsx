import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { universityApi, majorApi } from '@/lib/api';
import { LoadingSpinner, EmptyState } from '@/components/shared';

export function UniversityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const universityId = Number(id);

  const { data: university, isLoading: loadingUniversity, error: universityError } = useQuery({
    queryKey: ['university', universityId],
    queryFn: () => universityApi.getById(universityId),
    enabled: !!universityId,
  });

  const { data: majors, isLoading: loadingMajors } = useQuery({
    queryKey: ['majors', 'university', universityId],
    queryFn: () => majorApi.getByUniversity(universityId, { limit: 50 }),
    enabled: !!universityId,
  });

  if (loadingUniversity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (universityError || !university) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <EmptyState
            title="Không tìm thấy trường đại học"
            description="Trường này có thể không tồn tại."
            icon="🏛️"
            action={
              <Link to="/universities" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                Quay lại danh sách
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6">
          <ol className="list-none p-0 flex items-center text-gray-500">
            <li>
              <Link to="/" className="hover:text-primary-600">Trang chủ</Link>
            </li>
            <li className="mx-2">/</li>
            <li>
              <Link to="/universities" className="hover:text-primary-600">Trường đại học</Link>
            </li>
            <li className="mx-2">/</li>
            <li className="text-gray-900 font-medium">{university.name}</li>
          </ol>
        </nav>

        {/* University Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-xl bg-primary-100 flex items-center justify-center text-3xl font-bold text-primary-600 shrink-0">
              {university.shortName?.charAt(0) || university.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {university.shortName || university.name}
              </h1>
              {university.shortName && (
                <p className="text-lg text-gray-600 mt-1">{university.name}</p>
              )}
              {university.address && (
                <p className="text-gray-500 mt-2 flex items-center gap-2">
                  <span>📍</span> {university.address}
                </p>
              )}
              {university.website && (
                <a
                  href={university.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline mt-2 inline-block"
                >
                  🌐 {university.website}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Majors */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              📚 Các ngành học ({majors?.meta.total || 0})
            </h2>
            <Link
              to={`/search?universityId=${universityId}`}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Xem tất cả sách →
            </Link>
          </div>

          {loadingMajors ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : !majors?.data || majors.data.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
              Chưa có ngành học nào
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {majors.data.map((major) => (
                <Link
                  key={major.id}
                  to={`/search?majorId=${major.id}`}
                  className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-primary-200 transition-all"
                >
                  <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                    {major.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {major.code} • {major._count?.courses || 0} môn
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white text-center">
          <h2 className="text-xl font-bold mb-2">Tìm sách từ {university.name}</h2>
          <p className="text-primary-100 mb-4">
            Xem tất cả sách được bán tại trường này
          </p>
          <Link
            to={`/search?universityId=${universityId}`}
            className="inline-block px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Tìm sách ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
