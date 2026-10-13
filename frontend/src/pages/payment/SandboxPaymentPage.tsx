/**
 * Sandbox Payment Confirmation Page
 * 
 * Flow:
 * 1. User redirected here after creating VNPAY sandbox payment
 * 2. Shows QR code placeholder and payment details
 * 3. User clicks "Đã thanh toán" to confirm
 * 4. Payment is marked as successful
 */

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { LoadingSpinner } from '../../components/shared';
import { toast } from 'sonner';
import SEOMeta from '../../components/seo/SEOMeta';

interface PaymentDetails {
  id: number;
  orderId: number;
  amount: number;
  method: string;
  status: string;
  transactionId: string;
  gatewayResponse?: {
    sandbox?: boolean;
    message?: string;
    instructions?: string[];
  };
  order?: {
    orderNumber: string;
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
  };
}

export default function SandboxPaymentPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  
  const txnRef = searchParams.get('txnRef') || '';

  useEffect(() => {
    if (paymentId) {
      fetchPaymentDetails();
    }
  }, [paymentId]);

  const fetchPaymentDetails = async () => {
    try {
      const token = localStorage.getItem('auth_user');
      const accessToken = token ? JSON.parse(token)?.accessToken : null;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Không thể lấy thông tin thanh toán');
      }

      const data = await response.json();
      setPayment(data);
    } catch (error: any) {
      toast.error(error.message || 'Đã xảy ra lỗi');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    setSubmitting(true);
    
    try {
      // Simulate bank processing delay (3 seconds)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const token = localStorage.getItem('auth_user');
      const accessToken = token ? JSON.parse(token)?.accessToken : null;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/payments/sandbox/confirm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            paymentId: parseInt(paymentId!),
            transactionId: txnRef,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Xác nhận thất bại');
      }

      toast.success('Thanh toán thành công! (Sandbox Mode)');
      navigate('/orders');
    } catch (error: any) {
      toast.error(error.message || 'Đã xảy ra lỗi');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
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

  if (!payment) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Không tìm thấy thông tin thanh toán</h1>
        <Link to="/orders" className="text-primary-600 hover:underline">
          Quay lại đơn hàng
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEOMeta
        title="Thanh toán Sandbox VNPAY"
        description="Xác nhận thanh toán qua cổng VNPAY Sandbox"
      />

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📱</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán qua VNPAY</h1>
          <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
            🧪 Sandbox Mode - Demo
          </span>
        </div>

        {/* Transaction Reference */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Mã giao dịch VNPAY</h2>
          <div className="flex items-center gap-4">
            <code className="flex-1 text-xl font-mono font-bold text-blue-800 bg-white px-4 py-3 rounded-lg border border-blue-200">
              {txnRef}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(txnRef)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Copy
            </button>
          </div>
        </div>

        {/* QR Code Placeholder */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 text-center">
          <h2 className="text-lg font-semibold mb-4">Quét mã QR</h2>
          <div className="bg-gray-100 rounded-lg p-8 mb-4 inline-block">
            <div className="w-48 h-48 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-2">📱</div>
                <p className="text-sm text-gray-500">VNPAY QR Code</p>
                <p className="text-xs text-gray-400 mt-1">(Sandbox Mode)</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Sử dụng ứng dụng ngân hàng để quét mã QR
          </p>
        </div>

        {/* Amount */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-green-900 mb-2">Số tiền thanh toán</h2>
          <p className="text-3xl font-bold text-green-700">{formatPrice(payment.amount)}</p>
          {payment.order && (
            <p className="text-sm text-green-600 mt-2">
              Đơn hàng: #{payment.order.orderNumber}
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-yellow-900 mb-4">Hướng dẫn (Sandbox Mode)</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
            <li>Quét mã QR bằng ứng dụng ngân hàng</li>
            <li>Kiểm tra thông tin thanh toán</li>
            <li>Xác nhận thanh toán trong ứng dụng</li>
            <li className="font-semibold">Nhấn nút "Đã thanh toán" bên dưới để hoàn tất (Demo)</li>
          </ol>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirmPayment}
          disabled={submitting}
          className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold text-lg"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Đang xử lý thanh toán...
            </span>
          ) : (
            '✅ Đã thanh toán thành công'
          )}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Đây là chế độ demo - không cần thanh toán thật
        </p>

        {/* Order Info */}
        {payment.order && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
            <h3 className="font-semibold mb-2">Thông tin giao hàng</h3>
            <p><strong>Người nhận:</strong> {payment.order.shippingName}</p>
            <p><strong>Điện thoại:</strong> {payment.order.shippingPhone}</p>
            <p><strong>Địa chỉ:</strong> {payment.order.shippingAddress}</p>
          </div>
        )}
      </div>
    </>
  );
}
