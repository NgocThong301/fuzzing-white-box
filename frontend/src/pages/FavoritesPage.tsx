import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { favoriteApi } from '@/lib/api';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { CONDITION_LABELS, CONDITION_COLORS, Favorite } from '@/types';
import { toast } from 'sonner';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
};

export default function FavoritesPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['favorites', page],
    queryFn: () => favoriteApi.getAll({ page, limit: 12 }),
  });

  const removeMutation = useMutation({
    mutationFn: (listingId: number) => favoriteApi.remove(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success('Đã xóa khỏi danh sách yêu thích');
    },
    onError: () => {
      toast.error('Không thể xóa khỏi danh sách yêu thích');
    },
  });

  const handleRemove = (listingId: number) => {
    if (confirm('Bạn có chắc muốn xóa khỏi danh sách yêu thích?')) {
      removeMutation.mutate(listingId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          title="Đã xảy ra lỗi"
          description="Không thể tải danh sách yêu thích"
          icon="error"
        />
      </div>
    );
  }

  const favorites = data?.data || [];
  const meta = data?.meta;

  if (favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Danh sách yêu thích</h1>
        <EmptyState
          title="Chưa có sản phẩm yêu thích"
          description="Hãy thêm sản phẩm bạn thích vào danh sách yêu thích"
          action={
            <Link to="/books" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Khám phá sản phẩm
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Danh sách yêu thích</h1>
        <p className="text-gray-500 mt-1">{meta?.total || 0} sản phẩm</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favorites.map((favorite: Favorite) => {
          const listing = favorite.listing;
          const bookCover = listing.book?.coverImage || listing.images?.[0]?.url || '/placeholder-book.jpg';

          return (
            <div key={favorite.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <Link to={`/listings/${listing.id}`} className="block">
                <div className="aspect-[3/4] relative bg-gray-100">
                  <img
                    src={bookCover}
                    alt={listing.book?.title || 'Book'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-book.jpg';
                    }}
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${CONDITION_COLORS[listing.condition]}`}>
                      {CONDITION_LABELS[listing.condition]}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
                    {listing.book?.title || 'Sách không tên'}
                  </h3>
                  {listing.book?.author && (
                    <p className="text-sm text-gray-500 mb-2">{listing.book.author}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary-600">
                      {formatPrice(listing.price)}
                    </span>
                  </div>
                </div>
              </Link>
              <div className="px-4 pb-4 flex gap-2">
                <button
                  onClick={() => handleRemove(listing.id)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Xóa
                </button>
                <Link
                  to={`/listings/${listing.id}`}
                  className="flex-1 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-center"
                >
                  Mua ngay
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={!meta.hasPrev}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Trước
          </button>
          <span className="px-4 py-2">
            Trang {page} / {meta.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
            disabled={!meta.hasNext}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
