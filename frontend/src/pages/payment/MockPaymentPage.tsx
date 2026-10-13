import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { paymentApi } from '../../lib/api';
import { LoadingSpinner } from '../../components/shared';

export default function MockPaymentPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const [selectedAction, setSelectedAction] = useState<'SUCCESS' | 'FAILED' | 'CANCELLED' | null>(null);
  const [failureReason, setFailureReason] = useState('');

  // Fetch payment details
  const { data: payment, isLoading: paymentLoading, error } = useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => paymentApi.getById(Number(paymentId)),
    enabled: !!paymentId,
  });

  // Process callback mutation
  const callbackMutation = useMutation({
    mutationFn: (status: 'SUCCESS' | 'FAILED' | 'CANCELLED') =>
      paymentApi.mockCallback(Number(paymentId), {
        status,
        failureReason: status === 'FAILED' ? failureReason : undefined,
      }),
    onSuccess: (data) => {
      if (data.success) {
        navigate('/payment/success', {
          state: { payment: data.payment },
        });
      } else {
        navigate('/payment/failed', {
          state: { payment: data.payment, message: data.message },
        });
      }
    },
    onError: (err: Error) => {
      navigate('/payment/failed', {
        state: { message: err.message },
      });
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (paymentLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy thanh toán</h1>
        <p className="text-gray-500 mb-8">Thông tin thanh toán không tồn tại hoặc đã hết hạn</p>
        <button
          onClick={() => navigate('/orders')}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
        >
          Quay lại đơn hàng
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Sandbox Warning Banner */}
      <div className="bg-yellow-50 border-b border-yellow-200">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <div>
              <p className="font-semibold text-yellow-800">MÔI TRƯỜNG MÔ PHỎNG - SANDBOX</p>
              <p className="text-sm text-yellow-700">
                Đây là hệ thống thanh toán mô phỏng dành cho mục đích học tập. KHÔNG có tiền thật được chuyển.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4">
        {/* Payment Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-900">Thanh toán Mô phỏng</h1>
            <div className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
              MOCK GATEWAY
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Mã thanh toán</p>
            <p className="font-mono font-medium text-gray-900">PAY-{payment.id.toString().padStart(6, '0')}</p>
          </div>

          {/* Amount */}
          <div className="text-center py-6 border-y border-gray-200 mb-6">
            <p className="text-sm text-gray-500 mb-2">Số tiền thanh toán</p>
            <p className="text-4xl font-bold text-primary-600">
              {formatPrice(payment.amount)}
            </p>
          </div>

          {/* Payment Method */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-gray-600">Phương thức</span>
            <span className="font-medium">
              {payment.method === 'MOCK_ONLINE' ? '💳 Thẻ Mô phỏng' : '💵 COD'}
            </span>
          </div>

          {/* Expiry Warning */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-xl">⏱️</span>
              <div>
                <p className="font-medium text-orange-800">Thanh toán có hiệu lực trong 30 phút</p>
                <p className="text-sm text-orange-600">
                  Vui lòng hoàn tất thanh toán trước khi hết thời gian
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mock Payment Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Chọn kết quả thanh toán</h2>
          <p className="text-sm text-gray-500 mb-6">
            (Đây là mô phỏng - Hãy chọn một trong các tùy chọn bên dưới)
          </p>

          <div className="space-y-3">
            {/* SUCCESS Button */}
            <button
              type="button"
              onClick={() => setSelectedAction('SUCCESS')}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selectedAction === 'SUCCESS'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedAction === 'SUCCESS' ? 'bg-green-500' : 'bg-gray-200'
                }`}>
                  <span className="text-2xl text-white">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Thanh toán thành công</p>
                  <p className="text-sm text-gray-500">Mô phỏng thanh toán thẻ thành công</p>
                </div>
              </div>
            </button>

            {/* FAILED Button */}
            <button
              type="button"
              onClick={() => setSelectedAction('FAILED')}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selectedAction === 'FAILED'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedAction === 'FAILED' ? 'bg-red-500' : 'bg-gray-200'
                }`}>
                  <span className="text-2xl text-white">✕</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Thanh toán thất bại</p>
                  <p className="text-sm text-gray-500">Mô phỏng thanh toán bị từ chối</p>
                </div>
              </div>
            </button>

            {/* CANCELLED Button */}
            <button
              type="button"
              onClick={() => setSelectedAction('CANCELLED')}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selectedAction === 'CANCELLED'
                  ? 'border-gray-500 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedAction === 'CANCELLED' ? 'bg-gray-500' : 'bg-gray-200'
                }`}>
                  <span className="text-2xl text-white">○</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Hủy thanh toán</p>
                  <p className="text-sm text-gray-500">Quay lại trang đơn hàng</p>
                </div>
              </div>
            </button>
          </div>

          {/* Failure Reason (only show if FAILED is selected) */}
          {selectedAction === 'FAILED' && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do thất bại (tùy chọn)
              </label>
              <select
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="">Chọn lý do...</option>
                <option value="insufficient_funds">Tài khoản không đủ số dư</option>
                <option value="card_declined">Thẻ bị từ chối</option>
                <option value="expired_card">Thẻ hết hạn</option>
                <option value="invalid_card">Thông tin thẻ không hợp lệ</option>
                <option value="network_error">Lỗi mạng</option>
              </select>
            </div>
          )}

          {/* Process Button */}
          <button
            type="button"
            onClick={() => selectedAction && callbackMutation.mutate(selectedAction)}
            disabled={!selectedAction || callbackMutation.isPending}
            className={`w-full mt-6 py-4 rounded-lg font-semibold text-white transition-colors ${
              selectedAction === 'SUCCESS'
                ? 'bg-green-600 hover:bg-green-700'
                : selectedAction === 'FAILED'
                ? 'bg-red-600 hover:bg-red-700'
                : selectedAction === 'CANCELLED'
                ? 'bg-gray-600 hover:bg-gray-700'
                : 'bg-gray-400 cursor-not-allowed'
            } disabled:bg-gray-400 disabled:cursor-not-allowed`}
          >
            {callbackMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Đang xử lý...
              </span>
            ) : (
              `Xác nhận ${selectedAction === 'SUCCESS' ? 'thành công' : selectedAction === 'FAILED' ? 'thất bại' : 'hủy'}`
            )}
          </button>

          {/* Back to Orders */}
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="w-full mt-3 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Quay lại đơn hàng
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p className="mb-2">
            🔒 Giao dịch được bảo mật với mã hóa SSL 256-bit
          </p>
          <p>
            Đây là môi trường mô phỏng. Không lưu trữ thông tin thẻ thật.
          </p>
        </div>
      </div>
    </div>
  );
}
