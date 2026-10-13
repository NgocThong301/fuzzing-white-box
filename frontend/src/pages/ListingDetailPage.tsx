import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingApi, cartApi } from '@/lib/api';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { CONDITION_LABELS, CONDITION_COLORS } from '@/types';
import { toast } from 'sonner';

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const listingId = Number(id);
  const queryClient = useQueryClient();

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: () => listingApi.getById(listingId),
    enabled: !!listingId,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: () => cartApi.addItem({ listingId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Đã thêm vào giỏ hàng');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể thêm vào giỏ hàng');
    },
  });

  const handleAddToCart = () => {
    addToCartMutation.mutate();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <EmptyState
            title="Không tìm thấy tin đăng"
            description="Tin đăng này có thể đã bị xóa hoặc không tồn tại."
            icon="📋"
            action={
              <Link to="/books" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                Quay lại danh sách
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const primaryImage = listing.images?.find(img => img.isPrimary) || listing.images?.[0];
  const coverImage = primaryImage?.url || listing.book?.coverImage || `https://picsum.photos/seed/${listing.id}/600/800`;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6">
          <ol className="list-none p-0 flex items-center text-gray-500 flex-wrap">
            <li>
              <Link to="/" className="hover:text-primary-600">Trang chủ</Link>
            </li>
            <li className="mx-2">/</li>
            <li>
              <Link to="/books" className="hover:text-primary-600">Sách</Link>
            </li>
            {listing.book && (
              <>
                <li className="mx-2">/</li>
                <li>
                  <Link to={`/books/${listing.bookId}`} className="hover:text-primary-600 line-clamp-1 max-w-[150px]">
                    {listing.book.title}
                  </Link>
                </li>
              </>
            )}
            <li className="mx-2">/</li>
            <li className="text-gray-900 font-medium">Tin đăng #{listing.id}</li>
          </ol>
        </nav>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Images */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <div className="aspect-[4/5] bg-gray-100">
                <img
                  src={coverImage}
                  alt={listing.book?.title || 'Book'}
                  className="w-full h-full object-cover"
                />
              </div>
              {listing.images && listing.images.length > 1 && (
                <div className="p-4 border-t border-gray-100">
                  <div className="flex gap-2 overflow-x-auto">
                    {listing.images.map((img) => (
                      <img
                        key={img.id}
                        src={img.url}
                        alt=""
                        className="w-16 h-16 object-cover rounded-lg cursor-pointer border-2 border-transparent hover:border-primary-500"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Book Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {listing.book?.title || 'Unknown Book'}
                  </h1>
                  {listing.book?.author && (
                    <p className="text-gray-600 mt-1">by {listing.book.author}</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${CONDITION_COLORS[listing.condition]}`}>
                  {CONDITION_LABELS[listing.condition]}
                </span>
              </div>

              {/* Price */}
              <div className="text-3xl font-bold text-primary-600 mb-4">
                {formatPrice(Number(listing.price))}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
                {listing.location && (
                  <div>
                    <p className="text-sm text-gray-500">Địa điểm</p>
                    <p className="font-medium">📍 {listing.location}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Số lượng</p>
                  <p className="font-medium">{listing.quantity} cuốn</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vận chuyển</p>
                  <p className="font-medium">
                    {listing.shippingOption === 'PICKUP' && '📍 Nhận tại chỗ'}
                    {listing.shippingOption === 'DELIVERY' && '🚚 Giao hàng'}
                    {listing.shippingOption === 'BOTH' && '📍 + 🚚 Cả hai'}
                  </p>
                </div>
                {listing.book?.isbn && (
                  <div>
                    <p className="text-sm text-gray-500">ISBN</p>
                    <p className="font-medium">{listing.book.isbn}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {listing.description && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Mô tả</h3>
                  <p className="text-gray-600 whitespace-pre-line">{listing.description}</p>
                </div>
              )}
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Người bán</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-xl font-bold text-primary-600">
                  {listing.seller?.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{listing.seller?.fullName || 'Người bán'}</p>
                  <p className="text-sm text-gray-500">{listing.seller?.email}</p>
                </div>
              </div>
              {listing.status === 'APPROVED' && listing.quantity > 0 ? (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={addToCartMutation.isPending}
                    className="flex-1 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400"
                  >
                    {addToCartMutation.isPending ? 'Đang thêm...' : '🛒 Thêm vào giỏ hàng'}
                  </button>
                  <Link
                    to="/cart"
                    className="py-3 px-4 border border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    Xem giỏ hàng
                  </Link>
                </div>
              ) : (
                <div className="mt-4 py-3 bg-gray-100 text-gray-500 font-semibold rounded-lg text-center">
                  {listing.quantity === 0 ? 'Hết hàng' : 'Không khả dụng'}
                </div>
              )}
            </div>

            {/* Related Book */}
            {listing.book && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Về cuốn sách này</h3>
                <Link to={`/books/${listing.bookId}`} className="flex gap-4 hover:bg-gray-50 p-2 -m-2 rounded-lg transition-colors">
                  <img
                    src={listing.book.coverImage || `https://picsum.photos/seed/${listing.bookId}/200/300`}
                    alt={listing.book.title}
                    className="w-20 h-28 object-cover rounded-lg"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{listing.book.title}</p>
                    {listing.book.author && (
                      <p className="text-sm text-gray-500 mt-1">{listing.book.author}</p>
                    )}
                    {listing.book.publisher && (
                      <p className="text-sm text-gray-500">{listing.book.publisher}</p>
                    )}
                    <p className="text-sm text-primary-600 mt-2">Xem thông tin sách →</p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
