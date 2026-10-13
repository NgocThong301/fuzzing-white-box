import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi, reviewApi } from '../../lib/api';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, OrderStatus } from '../../types';
import { LoadingSpinner } from '../../components/shared';
import { toast } from 'sonner';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Fetch order
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getById(Number(id)),
    enabled: !!id,
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (data: { status: OrderStatus; reason?: string }) =>
      orderApi.updateStatus(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      toast.success('Cập nhật trạng thái thành công');
      setShowCancelModal(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Cập nhật thất bại');
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCancel = () => {
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy');
      return;
    }
    updateStatusMutation.mutate({
      status: 'CANCELLED' as OrderStatus,
      reason: cancelReason,
    });
  };

  const handleConfirm = () => {
    updateStatusMutation.mutate({ status: 'CONFIRMED' as OrderStatus });
  };

  const handleComplete = () => {
    updateStatusMutation.mutate({ status: 'COMPLETED' as OrderStatus });
  };

  // Review mutation
  const submitReviewMutation = useMutation({
    mutationFn: (data: { orderId: number; rating: number; comment?: string }) =>
      reviewApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setShowReviewForm(false);
      setReviewRating(5);
      setReviewComment('');
      toast.success('Cảm ơn bạn đã đánh giá!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể gửi đánh giá');
    },
  });

  const handleSubmitReview = () => {
    if (!order) return;
    submitReviewMutation.mutate({
      orderId: order.id,
      rating: reviewRating,
      comment: reviewComment || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Đã xảy ra lỗi</h2>
          <p className="text-gray-500 mb-4">Không thể tải thông tin đơn hàng</p>
          <button
            onClick={() => navigate('/orders')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <button
            onClick={() => navigate('/orders')}
            className="text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Đơn hàng #{order.orderNumber}</h1>
          <p className="text-gray-500 mt-1">Đặt ngày {formatDate(order.createdAt)}</p>
        </div>
        <span className={`px-4 py-2 text-sm font-medium rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-8">
        {order.status === 'PENDING_PAYMENT' && (
          <>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Thanh toán ngay
            </button>
            <button
              onClick={() => setShowCancelModal(true)}
              className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100"
            >
              Hủy đơn
            </button>
          </>
        )}
        {order.status === 'CONFIRMED' && (
          <button
            onClick={handleConfirm}
            disabled={updateStatusMutation.isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {updateStatusMutation.isPending ? 'Đang xử lý...' : 'Bắt đầu chuẩn bị'}
          </button>
        )}
        {order.status === 'DELIVERED' && (
          <button
            onClick={handleComplete}
            disabled={updateStatusMutation.isPending}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            {updateStatusMutation.isPending ? 'Đang xử lý...' : 'Xác nhận đã nhận hàng'}
          </button>
        )}
        {order.status === 'COMPLETED' && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 flex items-center gap-2"
          >
            <span>⭐</span>
            Đánh giá người bán
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sản phẩm</h2>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
                  <div
                    className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/listings/${item.listingId}`)}
                  >
                    {item.listing?.images?.[0] ? (
                      <img
                        src={item.listing.images[0].url}
                        alt={item.listing?.book?.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                        📚
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className="font-medium text-gray-900 hover:text-primary-600 cursor-pointer"
                      onClick={() => navigate(`/listings/${item.listingId}`)}
                    >
                      {item.listing?.book?.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.listing?.book?.author}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">
                        {item.quantity} x {formatPrice(item.unitPrice)}
                      </span>
                      <span className="font-medium">{formatPrice(item.subtotal)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái đơn hàng</h2>
            <div className="space-y-4">
              {order.status !== 'CANCELLED' && order.status !== 'DISPUTED' && (
                <>
                  <div className={`flex gap-4 ${['PENDING_PAYMENT', 'CONFIRMED', 'PREPARING', 'SHIPPING', 'DELIVERED', 'COMPLETED'].includes(order.status) ? '' : 'opacity-50'}`}>
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Đặt hàng thành công</p>
                      <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className={`flex gap-4 ml-4 ${['CONFIRMED', 'PREPARING', 'SHIPPING', 'DELIVERED', 'COMPLETED'].includes(order.status) ? '' : 'opacity-50'}`}>
                    <div className="w-0.5 h-8 bg-gray-200 -ml-4 mr-4"></div>
                  </div>
                  <div className={`flex gap-4 ${['CONFIRMED', 'PREPARING', 'SHIPPING', 'DELIVERED', 'COMPLETED'].includes(order.status) ? '' : 'opacity-50'}`}>
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Người bán xác nhận</p>
                      <p className="text-sm text-gray-500">Đơn hàng đang được xử lý</p>
                    </div>
                  </div>
                  <div className={`flex gap-4 ml-4 ${['PREPARING', 'SHIPPING', 'DELIVERED', 'COMPLETED'].includes(order.status) ? '' : 'opacity-50'}`}>
                    <div className="w-0.5 h-8 bg-gray-200 -ml-4 mr-4"></div>
                  </div>
                  <div className={`flex gap-4 ${['PREPARING', 'SHIPPING', 'DELIVERED', 'COMPLETED'].includes(order.status) ? '' : 'opacity-50'}`}>
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Đang chuẩn bị</p>
                      <p className="text-sm text-gray-500">Người bán đang chuẩn bị hàng</p>
                    </div>
                  </div>
                  <div className={`flex gap-4 ml-4 ${['SHIPPING', 'DELIVERED', 'COMPLETED'].includes(order.status) ? '' : 'opacity-50'}`}>
                    <div className="w-0.5 h-8 bg-gray-200 -ml-4 mr-4"></div>
                  </div>
                  <div className={`flex gap-4 ${['SHIPPING', 'DELIVERED', 'COMPLETED'].includes(order.status) ? '' : 'opacity-50'}`}>
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Đang giao hàng</p>
                      <p className="text-sm text-gray-500">Đơn hàng đang được vận chuyển</p>
                    </div>
                  </div>
                  <div className={`flex gap-4 ml-4 ${['DELIVERED', 'COMPLETED'].includes(order.status) ? '' : 'opacity-50'}`}>
                    <div className="w-0.5 h-8 bg-gray-200 -ml-4 mr-4"></div>
                  </div>
                  <div className={`flex gap-4 ${order.status === 'COMPLETED' ? '' : 'opacity-50'}`}>
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Hoàn thành</p>
                      <p className="text-sm text-gray-500">
                        {order.completedAt ? formatDate(order.completedAt) : 'Chờ xác nhận'}
                      </p>
                    </div>
                  </div>
                </>
              )}
              {order.status === 'CANCELLED' && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 text-sm">✕</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Đơn hàng đã bị hủy</p>
                    <p className="text-sm text-gray-500">
                      {order.cancelledAt && formatDate(order.cancelledAt)}
                    </p>
                    {order.cancellationReason && (
                      <p className="text-sm text-gray-500 mt-1">
                        Lý do: {order.cancellationReason}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tổng cộng</h2>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Tổng</span>
                <span className="text-primary-600">{formatPrice(order.finalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Địa chỉ giao hàng</h2>
            <p className="text-gray-700">{order.shippingName}</p>
            <p className="text-gray-500 mt-1">{order.shippingPhone}</p>
            <p className="text-gray-500 mt-1">{order.shippingAddress}</p>
            {order.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">Ghi chú:</p>
                <p className="text-gray-700">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Seller Info */}
          {order.seller && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Người bán</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  {order.seller.avatar ? (
                    <img
                      src={order.seller.avatar}
                      alt={order.seller.fullName}
                      className="w-full h-full rounded-full"
                    />
                  ) : (
                    <span className="text-gray-500">{order.seller.fullName.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{order.seller.fullName}</p>
                  <p className="text-sm text-gray-500">{order.seller.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Review Form */}
          {showReviewForm && order.status === 'COMPLETED' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Đánh giá người bán</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đánh giá của bạn
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className={`text-3xl cursor-pointer hover:scale-110 transition-transform ${
                            star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {reviewRating === 5 && 'Xuất sắc'}
                      {reviewRating === 4 && 'Tốt'}
                      {reviewRating === 3 && 'Khá'}
                      {reviewRating === 2 && 'Trung bình'}
                      {reviewRating === 1 && 'Kém'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhận xét (không bắt buộc)
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    rows={4}
                    placeholder="Chia sẻ trải nghiệm của bạn với người bán này..."
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowReviewForm(false);
                      setReviewRating(5);
                      setReviewComment('');
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={submitReviewMutation.isPending}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400"
                  >
                    {submitReviewMutation.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hủy đơn hàng</h3>
            <p className="text-gray-500 mb-4">Vui lòng nhập lý do hủy đơn hàng:</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={4}
              placeholder="Lý do hủy đơn..."
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Đóng
              </button>
              <button
                onClick={handleCancel}
                disabled={updateStatusMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
              >
                {updateStatusMutation.isPending ? 'Đang xử lý...' : 'Hủy đơn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
