import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../../lib/api';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { CONDITION_LABELS, CONDITION_COLORS } from '../../types';
import { LoadingSpinner } from '../../components/shared';
import { toast } from 'sonner';

export default function CartPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { cart, isLoading, refetch } = useCart();
  const { user } = useAuth();
  const [removingId, setRemovingId] = useState<number | null>(null);

  // Update quantity mutation
  const updateMutation = useMutation({
    mutationFn: ({ listingId, quantity }: { listingId: number; quantity: number }) =>
      cartApi.updateItem(listingId, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      refetch();
      toast.success('Đã cập nhật số lượng');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Cập nhật thất bại');
    },
  });

  // Remove item mutation
  const removeMutation = useMutation({
    mutationFn: (listingId: number) => cartApi.removeItem(listingId),
    onMutate: (listingId) => {
      setRemovingId(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      refetch();
      toast.success('Đã xóa sản phẩm');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Xóa thất bại');
    },
    onSettled: () => {
      setRemovingId(null);
    },
  });

  // Clear cart mutation
  const clearMutation = useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      refetch();
      toast.success('Đã xóa toàn bộ giỏ hàng');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Xóa thất bại');
    },
  });

  const handleQuantityChange = (listingId: number, currentQuantity: number, delta: number) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity >= 1) {
      updateMutation.mutate({ listingId, quantity: newQuantity });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h1>
        <p className="text-gray-500 mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
        <button
          onClick={() => navigate('/search')}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng của tôi</h1>
        <button
          onClick={() => clearMutation.mutate()}
          disabled={clearMutation.isPending}
          className="text-red-600 hover:text-red-700 text-sm font-medium"
        >
          {clearMutation.isPending ? 'Đang xóa...' : 'Xóa tất cả'}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const listing = item.listing;
            const primaryImage = listing.images?.[0];

            return (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex gap-4"
              >
                {/* Image */}
                <div
                  className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/listings/${listing.id}`)}
                >
                  {primaryImage ? (
                    <img
                      src={primaryImage.url}
                      alt={listing.book?.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      📚
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3
                        className="font-medium text-gray-900 hover:text-primary-600 cursor-pointer line-clamp-2"
                        onClick={() => navigate(`/listings/${listing.id}`)}
                      >
                        {listing.book?.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {listing.book?.author}
                      </p>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeMutation.mutate(listing.id)}
                      disabled={removingId === listing.id}
                      className="text-gray-400 hover:text-red-500 ml-4"
                    >
                      {removingId === listing.id ? (
                        <span className="text-sm">...</span>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${CONDITION_COLORS[listing.condition]}`}>
                      {CONDITION_LABELS[listing.condition]}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(listing.id, item.quantity, -1)}
                        disabled={item.quantity <= 1 || updateMutation.isPending}
                        className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 min-w-[40px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(listing.id, item.quantity, 1)}
                        disabled={item.quantity >= listing.quantity || updateMutation.isPending}
                        className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-semibold text-primary-600">
                        {formatPrice(item.subtotal || 0)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-sm text-gray-500">
                          {formatPrice(item.price || 0)} x {item.quantity}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stock warning */}
                  {item.quantity >= listing.quantity && (
                    <p className="text-xs text-orange-600 mt-2">
                      Đã đạt số lượng tối đa trong kho
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tổng cộng</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Số sản phẩm</span>
                <span>{items.length}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Tổng</span>
                <span className="text-primary-600">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Tiến hành đặt hàng
            </button>

            <button
              onClick={() => navigate('/search')}
              className="w-full mt-3 text-gray-600 py-2 px-4 font-medium hover:text-primary-600 transition-colors"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
