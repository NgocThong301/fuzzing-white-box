import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listingApi, categoryApi, universityApi } from '@/lib/api';
import { ListingCard, Pagination, ListingGridSkeleton, EmptyState } from '@/components/shared';
import { BookCondition, CONDITION_LABELS } from '@/types';

export function BooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 24;
  const q = searchParams.get('q') || '';
  const categoryId = searchParams.get('categoryId');
  const universityId = searchParams.get('universityId');
  const condition = searchParams.get('condition') as BookCondition | null;
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  // Fetch listings
  const { data, isLoading, error } = useQuery({
    queryKey: ['listings', { page, limit, q, categoryId, universityId, condition, minPrice, maxPrice, sortBy, sortOrder }],
    queryFn: () => listingApi.getAll({
      page,
      limit,
      q: q || undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      universityId: universityId ? Number(universityId) : undefined,
      condition: condition || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy,
      sortOrder,
    }),
  });

  // Fetch filters options
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll({ rootOnly: true }),
  });

  const { data: universities } = useQuery({
    queryKey: ['universities'],
    queryFn: () => universityApi.getAll({ limit: 20 }),
  });

  // Update URL params
  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    newParams.delete('page'); // Reset page when changing filters
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = q || categoryId || universityId || condition || minPrice || maxPrice;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Sách</h1>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          {/* Search & Sort Row */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm sách..."
                value={q}
                onChange={(e) => updateFilter('q', e.target.value || null)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
            <select
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('_');
                updateFilter('sortBy', by);
                updateFilter('sortOrder', order);
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="createdAt_desc">Mới nhất</option>
              <option value="price_asc">Giá thấp → cao</option>
              <option value="price_desc">Giá cao → thấp</option>
            </select>
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* University */}
            <select
              value={universityId || ''}
              onChange={(e) => updateFilter('universityId', e.target.value || null)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            >
              <option value="">Tất cả trường</option>
              {universities?.data.map((uni) => (
                <option key={uni.id} value={uni.id}>
                  {uni.shortName || uni.name}
                </option>
              ))}
            </select>

            {/* Category */}
            <select
              value={categoryId || ''}
              onChange={(e) => updateFilter('categoryId', e.target.value || null)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            >
              <option value="">Tất cả danh mục</option>
              {categories?.data.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Condition */}
            <select
              value={condition || ''}
              onChange={(e) => updateFilter('condition', e.target.value || null)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            >
              <option value="">Tất cả tình trạng</option>
              {Object.entries(CONDITION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            {/* Min Price */}
            <input
              type="number"
              placeholder="Giá từ"
              value={minPrice || ''}
              onChange={(e) => updateFilter('minPrice', e.target.value || null)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            />

            {/* Max Price */}
            <input
              type="number"
              placeholder="Giá đến"
              value={maxPrice || ''}
              onChange={(e) => updateFilter('maxPrice', e.target.value || null)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">
            {isLoading ? 'Đang tải...' : `Tìm thấy ${data?.meta.total || 0} kết quả`}
          </p>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <ListingGridSkeleton count={12} />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">
            Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.
          </div>
        ) : data?.data.length === 0 ? (
          <EmptyState
            title="Không tìm thấy sách nào"
            description="Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
            icon="📚"
            action={
              hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Xóa bộ lọc
                </button>
              )
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {data?.data.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            {data?.meta && <Pagination meta={data.meta} />}
          </>
        )}
      </div>
    </div>
  );
}
