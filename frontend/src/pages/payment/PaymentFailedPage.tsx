import { Link, useLocation } from 'react-router-dom';

export default function PaymentFailedPage() {
  const location = useLocation();
  const state = location.state as {
    payment?: {
      id: number;
      orderId: number;
      amount: number;
      failureReason?: string;
      method: string;
    };
    message?: string;
  } | undefined;

  const { payment, message } = state || {};

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Sandbox Warning Banner */}
      <div className="bg-yellow-50 border-b border-yellow-200 mb-8">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <div>
              <p className="font-semibold text-yellow-800">MÔI TRƯỜNG MÔ PHỎNG - SANDBOX</p>
              <p className="text-sm text-yellow-700">
                Đây là giao dịch mô phỏng. KHÔNG có tiền thật được chuyển.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4">
        {/* Failed Icon */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Thanh toán {payment ? 'thất bại' : 'bị hủy'}!
          </h1>
          <p className="text-gray-600">
            {message || 'Đã có lỗi xảy ra trong quá trình thanh toán.'}
          </p>
        </div>

        {/* Payment Details */}
        {payment && (
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
              
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Số tiền</span>
                <span className="font-bold text-gray-900">{formatPrice(payment.amount)}</span>
              </div>

              {payment.failureReason && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Lý do</span>
                  <span className="font-medium text-red-600">{payment.failureReason}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* What to do next */}
        <div className="bg-orange-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-orange-900 mb-2">💡 Bạn cần làm gì?</h3>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• Kiểm tra lại thông tin thanh toán</li>
            <li>• Thử lại với phương thức thanh toán khác</li>
            <li>• Liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {payment && (
            <Link
              to={`/payment/mock/${payment.id}`}
              className="block w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium text-center hover:bg-primary-700 transition-colors"
            >
              Thử thanh toán lại
            </Link>
          )}
          
          <Link
            to="/orders"
            className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium text-center hover:bg-gray-200 transition-colors"
          >
            Xem đơn hàng
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
