import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../../lib/api';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../types';
import { ControlledPagination, EmptyState, LoadingSpinner } from '../../components/shared';

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  // Fetch orders
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-orders', page],
    queryFn: () => orderApi.getMyOrders({ page, limit: 10 }),
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
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Đơn hàng của tôi</h1>
        <EmptyState
          icon="📦"
          title="Chưa có đơn hàng nào"
          description="Bạn chưa có đơn hàng nào. Hãy tiếp tục mua sắm!"
          action={
            <button
              onClick={() => navigate('/search')}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
            >
              Tìm kiếm sách
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Đơn hàng của tôi</h1>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/orders/${order.id}`)}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
                {ORDER_STATUS_LABELS[order.status]}
              </span>
            </div>

            {/* Items Preview */}
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
                {order.items && order.items.length > 3 && (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm text-gray-500">+{order.items.length - 3}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">
                    {order.items?.length || 0} sản phẩm
                  </p>
                  {order.seller && (
                    <p className="text-sm text-gray-500">
                      Người bán: {order.seller.fullName}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-600">
                    {formatPrice(order.finalAmount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/orders/${order.id}`);
                }}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Xem chi tiết
              </button>
              {order.status === 'DELIVERED' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle complete order
                  }}
                  className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  Xác nhận đã nhận
                </button>
              )}
              {order.status === 'PENDING_PAYMENT' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle payment
                  }}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Thanh toán
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
