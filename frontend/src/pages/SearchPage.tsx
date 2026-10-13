import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listingApi, categoryApi, universityApi } from '@/lib/api';
import { ListingCard, Pagination, ListingGridSkeleton, EmptyState } from '@/components/shared';
import { BookCondition, CONDITION_LABELS } from '@/types';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse all filters from URL
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 24;
  const q = searchParams.get('q') || '';
  const keyword = searchParams.get('keyword') || '';
  const universityId = searchParams.get('universityId');
  const majorId = searchParams.get('majorId');
  const courseId = searchParams.get('course');
  const categoryId = searchParams.get('categoryId');
  const condition = searchParams.get('condition') as BookCondition | null;
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const sort = searchParams.get('sort') || 'newest';

  // Map sort to API params
  const sortMap: Record<string, { sortBy: string; sortOrder: string }> = {
    newest: { sortBy: 'createdAt', sortOrder: 'desc' },
    price_asc: { sortBy: 'price', sortOrder: 'asc' },
    price_desc: { sortBy: 'price', sortOrder: 'desc' },
    popular: { sortBy: 'createdAt', sortOrder: 'desc' }, // TODO: implement popularity
  };
  const sortParams = sortMap[sort] || sortMap.newest;

  // Fetch listings
  const { data, isLoading, error } = useQuery({
    queryKey: ['search', Object.fromEntries(searchParams)],
    queryFn: () => listingApi.getAll({
      page,
      limit,
      q: q || keyword || undefined,
      universityId: universityId ? Number(universityId) : undefined,
      majorId: majorId ? Number(majorId) : undefined,
      courseId: courseId ? Number(courseId) : undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      condition: condition || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      ...sortParams,
    }),
  });

  // Fetch filter options
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll({ rootOnly: true }),
  });

  const { data: universities } = useQuery({
    queryKey: ['universities'],
    queryFn: () => universityApi.getAll({ limit: 50 }),
  });

  // Update URL params
  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = q || keyword || universityId || majorId || courseId || categoryId || condition || minPrice || maxPrice;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Tìm kiếm nâng cao</h1>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          {/* Main Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Từ khóa</label>
            <input
              type="text"
              placeholder="Tìm theo tên sách, ISBN, tác giả..."
              value={q || keyword}
              onChange={(e) => updateFilter('q', e.target.value || null)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* University */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trường đại học</label>
              <select
                value={universityId || ''}
                onChange={(e) => updateFilter('universityId', e.target.value || null)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">Tất cả trường</option>
                {universities?.data.map((uni) => (
                  <option key={uni.id} value={uni.id}>
                    {uni.shortName || uni.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
              <select
                value={categoryId || ''}
                onChange={(e) => updateFilter('categoryId', e.target.value || null)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">Tất cả danh mục</option>
                {categories?.data.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Course */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Học phần</label>
              <input
                type="text"
                placeholder="VD: CS101"
                value={courseId || ''}
                onChange={(e) => updateFilter('course', e.target.value || null)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tình trạng</label>
              <select
                value={condition || ''}
                onChange={(e) => updateFilter('condition', e.target.value || null)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">Tất cả</option>
                {Object.entries(CONDITION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá từ</label>
              <input
                type="number"
                placeholder="0"
                value={minPrice || ''}
                onChange={(e) => updateFilter('minPrice', e.target.value || null)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá đến</label>
              <input
                type="number"
                placeholder="1,000,000"
                value={maxPrice || ''}
                onChange={(e) => updateFilter('maxPrice', e.target.value || null)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>

          {/* Sort & Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <select
                value={sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá thấp → cao</option>
                <option value="price_desc">Giá cao → thấp</option>
                <option value="popular">Phổ biến</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full sm:w-auto px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {q && (
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-1">
                Tìm: {q}
                <button onClick={() => updateFilter('q', null)} className="ml-1 hover:text-primary-900">×</button>
              </span>
            )}
            {universityId && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1">
                Trường: {universities?.data.find(u => u.id === Number(universityId))?.name}
                <button onClick={() => updateFilter('universityId', null)} className="ml-1">×</button>
              </span>
            )}
            {condition && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1">
                {CONDITION_LABELS[condition]}
                <button onClick={() => updateFilter('condition', null)} className="ml-1">×</button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                Giá: {minPrice ? `${Number(minPrice).toLocaleString()}đ` : '0đ'} - {maxPrice ? `${Number(maxPrice).toLocaleString()}đ` : '∞'}
                <button onClick={() => { updateFilter('minPrice', null); updateFilter('maxPrice', null); }} className="ml-1">×</button>
              </span>
            )}
          </div>
        )}

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">
            {isLoading ? 'Đang tải...' : `Tìm thấy ${data?.meta.total || 0} kết quả`}
          </p>
        </div>

        {isLoading ? (
          <ListingGridSkeleton count={12} />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">
            Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.
          </div>
        ) : data?.data.length === 0 ? (
          <EmptyState
            title="Không tìm thấy kết quả"
            description="Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
            icon="🔍"
            action={
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Xóa bộ lọc
              </button>
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
