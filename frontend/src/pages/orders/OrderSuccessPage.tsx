import { useLocation, useNavigate } from 'react-router-dom';
import { Order } from '../../types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../types';

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orders, summary } = location.state || { orders: [], summary: {} };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy đơn hàng</h1>
        <p className="text-gray-500 mb-8">Có thể trang này đã hết hạn</p>
        <button
          onClick={() => navigate('/orders')}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Xem đơn hàng của tôi
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h1>
        <p className="text-gray-600">
          Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang chờ xác nhận từ người bán.
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tổng quan đơn hàng</h2>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Tạm tính</span>
            <span className="font-medium">{formatPrice(summary.subtotal || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phí vận chuyển</span>
            <span className="font-medium">{formatPrice(summary.shippingFee || 0)}</span>
          </div>
          {summary.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Giảm giá</span>
              <span>-{formatPrice(summary.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Tổng cộng</span>
            <span className="text-primary-600">{formatPrice(summary.totalAmount || 0)}</span>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
        {orders.map((order: Order) => (
          <div key={order.id} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                <p className="text-sm text-gray-500">
                  {order.items?.length || 0} sản phẩm
                </p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
                {ORDER_STATUS_LABELS[order.status]}
              </span>
            </div>

            <div className="space-y-2">
              {order.items?.slice(0, 2).map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.listing?.book?.title} x {item.quantity}
                  </span>
                  <span className="font-medium">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
              {order.items && order.items.length > 2 && (
                <p className="text-sm text-gray-500">
                  +{order.items.length - 2} sản phẩm khác
                </p>
              )}
            </div>

            {order.seller && (
              <p className="text-sm text-gray-500 mt-3 pt-3 border-t">
                Người bán: {order.seller.fullName}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Shipping Info */}
      <div className="bg-blue-50 rounded-lg p-4 mt-6">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900">Thông tin giao hàng</p>
            <p className="text-sm text-blue-700 mt-1">
              {orders[0]?.shippingAddress}
            </p>
            <p className="text-sm text-blue-700">
              {orders[0]?.shippingName} - {orders[0]?.shippingPhone}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={() => navigate('/orders')}
          className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          Xem đơn hàng của tôi
        </button>
        <button
          onClick={() => navigate('/search')}
          className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Tiếp tục mua sắm
        </button>
      </div>
    </div>
  );
}
