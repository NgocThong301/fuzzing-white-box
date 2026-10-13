/**
 * VNPAY Payment Result Page
 *
 * This page handles the redirect from VNPAY after payment completion.
 * It displays the payment result based on the query parameters.
 */

import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { LoadingSpinner } from '../../components/shared';
import SEOMeta from '../../components/seo/SEOMeta';

interface PaymentResult {
  success: boolean;
  message: string;
  orderId?: number;
  paymentId?: number;
  amount?: number;
  responseCode?: string;
}

export default function VnpayReturnPage() {
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get all query parameters from VNPAY
    const query: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      query[key] = value;
    });

    // Check if this is a valid VNPAY callback
    if (!query.vnp_ResponseCode) {
      setResult({
        success: false,
        message: 'Invalid payment callback - missing response code',
      });
      setLoading(false);
      return;
    }

    // Build result from query parameters
    const success = query.vnp_ResponseCode === '00';
    const message = getResponseMessage(query.vnp_ResponseCode);
    const amount = query.vnp_Amount ? parseInt(query.vnp_Amount) / 100 : undefined;

    setResult({
      success,
      message,
      amount,
      responseCode: query.vnp_ResponseCode,
    });
    setLoading(false);
  }, [searchParams]);

  const formatPrice = (price?: number) => {
    if (!price) return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <SEOMeta
        title="Kết quả thanh toán VNPAY"
        description="Xem kết quả giao dịch thanh toán qua VNPAY"
      />

      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
          {/* Status Icon */}
          <div className="mb-6">
            {result?.success ? (
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold mb-2">
            {result?.success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-4">{result?.message}</p>

          {/* Amount */}
          {result?.amount && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Số tiền thanh toán</p>
              <p className="text-2xl font-bold text-primary-600">{formatPrice(result.amount)}</p>
            </div>
          )}

          {/* Response Code */}
          <p className="text-sm text-gray-500 mb-6">
            Mã phản hồi: <span className="font-mono">{result?.responseCode}</span>
          </p>

          {/* Actions */}
          <div className="space-y-3">
            {result?.success ? (
              <>
                <Link
                  to="/orders"
                  className="block w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-medium"
                >
                  Xem đơn hàng của tôi
                </Link>
                <Link
                  to="/"
                  className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Tiếp tục mua sắm
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/cart/checkout"
                  className="block w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-medium"
                >
                  Thử lại thanh toán
                </Link>
                <Link
                  to="/orders"
                  className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Xem đơn hàng của tôi
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Sandbox Warning */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm text-center">
            <strong>⚠️ MÔI TRƯỜNG TEST:</strong> Đây là giao dịch thử nghiệm trên VNPAY Sandbox.
            Không có tiền thật được chuyển.
          </p>
        </div>
      </div>
    </>
  );
}

/**
 * Get human-readable message from VNPAY response code
 */
function getResponseMessage(code: string): string {
  const messages: Record<string, string> = {
    '00': 'Giao dịch thành công',
    '01': 'Giao dịch không tồn tại',
    '02': 'Xác nhận giao dịch thất bại',
    '04': 'Số tiền không hợp lệ',
    '05': 'Giao dịch không hợp lệ',
    '09': 'Ngân hàng không hỗ trợ',
    '11': 'Giao dịch đã hết hạn',
    '12': 'Giao dịch đang chờ xử lý',
    '13': 'Giao dịch đang được xử lý',
    '24': 'Giao dịch bị hủy',
    '51': 'Giao dịch bị từ chối',
    '65': 'Tài khoản không đủ số dư',
    '75': 'Quá nhiều yêu cầu',
    '81': 'Hệ thống đang bảo trì',
    '97': 'Chữ ký không hợp lệ',
    '99': 'Lỗi không xác định',
  };

  return messages[code] || `Lỗi không xác định (${code})`;
}
