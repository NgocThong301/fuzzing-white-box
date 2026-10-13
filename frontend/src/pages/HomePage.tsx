import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listingApi, categoryApi, universityApi } from '@/lib/api';
import { ListingCard, ListingGridSkeleton, EmptyState } from '@/components/shared';

export function HomePage() {
  // Fetch data for different sections
  const { data: newListings, isLoading: loadingNew } = useQuery({
    queryKey: ['listings', 'new'],
    queryFn: () => listingApi.getAll({ limit: 12, sortBy: 'createdAt', sortOrder: 'desc' }),
  });

  const { data: popularListings, isLoading: loadingPopular } = useQuery({
    queryKey: ['listings', 'popular'],
    queryFn: () => listingApi.getAll({ limit: 12, sortBy: 'price', sortOrder: 'asc' }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll({ limit: 8 }),
  });

  const { data: universities } = useQuery({
    queryKey: ['universities'],
    queryFn: () => universityApi.getAll({ limit: 6 }),
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              Mua bán sách giáo khoa
              <br />
              <span className="text-yellow-300">Giá sinh viên</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8">
              Kết nối sinh viên toàn quốc. Sách giáo khoa giá rẻ, chất lượng đảm bảo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/search"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Tìm kiếm sách
              </Link>
              <Link
                to="/listings/create"
                className="inline-flex items-center justify-center px-6 py-3 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Đăng bán ngay
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">📚 Danh mục sách</h2>
            <Link to="/categories" className="text-primary-600 hover:text-primary-700 font-medium">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories?.data.map((category) => (
              <Link
                key={category.id}
                to={`/search?categoryId=${category.id}`}
                className="flex flex-col items-center p-3 bg-white rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all text-center"
              >
                <span className="text-2xl mb-2">📚</span>
                <span className="text-sm font-medium text-gray-700 line-clamp-1">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Universities Section */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">🏛️ Trường học</h2>
            <Link to="/universities" className="text-primary-600 hover:text-primary-700 font-medium">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {universities?.data.map((university) => (
              <Link
                key={university.id}
                to={`/universities/${university.id}`}
                className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-xl font-bold text-primary-600 mb-2">
                  {university.shortName?.charAt(0) || university.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-700 line-clamp-1">
                  {university.shortName || university.name}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  {university._count?.majors || 0} ngành
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Listings Section */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">✨ Sách mới đăng</h2>
            <Link to="/search?sort=newest" className="text-primary-600 hover:text-primary-700 font-medium">
              Xem tất cả →
            </Link>
          </div>
          
          {loadingNew ? (
            <ListingGridSkeleton count={6} />
          ) : newListings?.data.length === 0 ? (
            <EmptyState
              title="Chưa có sách nào"
              description="Hãy là người đầu tiên đăng bán sách!"
              icon="📚"
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {newListings?.data.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Best Price Section */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">💰 Giá tốt nhất</h2>
            <Link to="/search?sort=price_asc" className="text-primary-600 hover:text-primary-700 font-medium">
              Xem tất cả →
            </Link>
          </div>
          
          {loadingPopular ? (
            <ListingGridSkeleton count={6} />
          ) : popularListings?.data.length === 0 ? (
            <EmptyState
              title="Chưa có sách nào"
              description="Hãy là người đầu tiên đăng bán sách!"
              icon="💰"
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {popularListings?.data.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Bạn có sách không sử dụng?</h2>
          <p className="text-lg text-primary-100 mb-6 max-w-2xl mx-auto">
            Đăng bán ngay để kiếm thêm thu nhập từ những cuốn sách giáo khoa cũ của bạn.
            Hàng nghìn sinh viên đang tìm kiếm sách mỗi ngày!
          </p>
          <Link
            to="/listings/create"
            className="inline-flex items-center px-8 py-4 bg-white text-primary-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Đăng bán miễn phí
          </Link>
        </div>
      </section>
    </div>
  );
}
