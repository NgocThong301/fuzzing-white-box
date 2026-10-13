import { Link, useLocation } from 'react-router-dom';

export default function PaymentSuccessPage() {
  const location = useLocation();
  const payment = location.state?.payment as {
    id: number;
    orderId: number;
    amount: number;
    transactionId?: string;
    method: string;
  } | undefined;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (!payment) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy thông tin</h1>
        <Link to="/orders" className="text-primary-600 hover:text-primary-700">
          Quay lại đơn hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Sandbox Warning Banner */}
      <div className="bg-green-50 border-b border-green-200 mb-8">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <span className="text-2xl">🎓</span>
            </div>
            <div>
              <p className="font-semibold text-green-800">MÔI TRƯỜNG HỌC TẬP</p>
              <p className="text-sm text-green-700">
                Đây là giao dịch mô phỏng. KHÔNG có tiền thật được chuyển.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h1>
          <p className="text-gray-600">Cảm ơn bạn đã thanh toán. Đơn hàng đang được xử lý.</p>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết thanh toán</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Mã thanh toán</span>
              <span className="font-medium font-mono">PAY-{payment.id.toString().padStart(6, '0')}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Mã đơn hàng</span>
              <span className="font-medium font-mono">#{payment.orderId}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Phương thức</span>
              <span className="font-medium">
                {payment.method === 'MOCK_ONLINE' ? '💳 Thẻ Mô phỏng' : '💵 COD'}
              </span>
            </div>
            
            {payment.transactionId && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Mã giao dịch</span>
                <span className="font-medium font-mono">{payment.transactionId}</span>
              </div>
            )}
            
            <div className="flex justify-between py-2">
              <span className="text-gray-900 font-semibold">Số tiền</span>
              <span className="text-xl font-bold text-green-600">{formatPrice(payment.amount)}</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Bước tiếp theo</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Người bán sẽ xác nhận đơn hàng trong 24 giờ</li>
            <li>• Bạn sẽ nhận được thông báo khi đơn hàng được xử lý</li>
            <li>• Theo dõi trạng thái đơn hàng trong mục "Đơn hàng của tôi"</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            to={`/orders/${payment.orderId}`}
            className="block w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium text-center hover:bg-primary-700 transition-colors"
          >
            Xem chi tiết đơn hàng
          </Link>
          
          <Link
            to="/orders"
            className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium text-center hover:bg-gray-200 transition-colors"
          >
            Danh sách đơn hàng
          </Link>
          
          <Link
            to="/search"
            className="block w-full text-gray-600 py-2 px-4 font-medium text-center hover:text-primary-600 transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
        </div>

        {/* Footer Notice */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Đây là môi trường mô phỏng dành cho mục đích học tập.
          <br />
          Không có tiền thật được chuyển.
        </p>
      </div>
    </div>
  );
}
