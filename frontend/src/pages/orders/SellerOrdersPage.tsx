import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../../lib/api';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, OrderStatus } from '../../types';
import { ControlledPagination, EmptyState, LoadingSpinner } from '../../components/shared';
import { toast } from 'sonner';

export default function SellerOrdersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  // Fetch seller orders
  const { data, isLoading, error } = useQuery({
    queryKey: ['seller-orders', page],
    queryFn: () => orderApi.getSellerOrders({ page, limit: 10 }),
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status, reason }: { orderId: number; status: OrderStatus; reason?: string }) =>
      orderApi.updateStatus(orderId, { status, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      toast.success('Cập nhật trạng thái thành công');
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
    });
  };

  const handleStatusUpdate = (orderId: number, status: OrderStatus) => {
    updateStatusMutation.mutate({ orderId, status });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Đã xảy ra lỗi</h2>
          <p className="text-gray-500 mb-4">Không thể tải danh sách đơn hàng</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const orders = data?.data || [];
  const meta = data?.meta;

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Quản lý đơn hàng</h1>
        <EmptyState
          icon="📦"
          title="Chưa có đơn hàng nào"
          description="Khi có khách đặt hàng, đơn sẽ xuất hiện tại đây."
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
              <div>
                <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
                {ORDER_STATUS_LABELS[order.status]}
              </span>
            </div>

            {/* Items */}
            <div className="p-4">
              <div className="flex gap-3 mb-4">
                {order.items?.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"
                  >
                    {item.listing?.images?.[0] ? (
                      <img
                        src={item.listing.images[0].url}
                        alt={item.listing?.book?.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
                        📚
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">
                    {order.items?.length || 0} sản phẩm
                  </p>
                  <p className="text-sm text-gray-500">
                    Người mua: {order.buyer?.fullName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-600">
                    {formatPrice(order.finalAmount)}
                  </p>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Giao đến:</span> {order.shippingAddress}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Người nhận:</span> {order.shippingName} - {order.shippingPhone}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap justify-end gap-2">
              <button
                onClick={() => navigate(`/orders/${order.id}`)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium px-3 py-1.5"
              >
                Chi tiết
              </button>

              {order.status === 'PENDING_PAYMENT' && (
                <button
                  onClick={() => handleStatusUpdate(order.id, 'CONFIRMED')}
                  disabled={updateStatusMutation.isPending}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Xác nhận đơn hàng
                </button>
              )}

              {order.status === 'CONFIRMED' && (
                <button
                  onClick={() => handleStatusUpdate(order.id, 'PREPARING')}
                  disabled={updateStatusMutation.isPending}
                  className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  Bắt đầu chuẩn bị
                </button>
              )}

              {order.status === 'PREPARING' && (
                <button
                  onClick={() => handleStatusUpdate(order.id, 'SHIPPING')}
                  disabled={updateStatusMutation.isPending}
                  className="bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:bg-gray-400"
                >
                  Đã gửi hàng
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-8">
          <ControlledPagination
            currentPage={page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
