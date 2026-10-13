/**
 * Banking Payment Confirmation Page
 *
 * Shows:
 * - Bank account information
 * - Transaction reference
 * - Amount to transfer
 * - Form to enter transfer reference
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { LoadingSpinner } from '../../components/shared';
import { toast } from 'sonner';
import SEOMeta from '../../components/seo/SEOMeta';

interface BankAccount {
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  branch: string;
  maskedAccountNumber: string;
}

interface PaymentDetails {
  paymentId: number;
  orderId: number;
  transactionRef: string;
  amount: number;
  orderNumber: string;
  expiresAt: string;
  bankAccounts: BankAccount[];
}

export default function BankingConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [transferRef, setTransferRef] = useState('');
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchPaymentDetails();
    }
  }, [orderId]);

  const fetchPaymentDetails = async () => {
    try {
      // Get token from the same source as other API calls
      const token = localStorage.getItem('auth_user');
      const accessToken = token ? JSON.parse(token)?.accessToken : null;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/payments/banking/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ orderId: parseInt(orderId!) }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Không thể tạo thanh toán');
      }

      const data = await response.json();
      setPayment(data);
      if (data.bankAccounts && data.bankAccounts.length > 0) {
        setSelectedBank(data.bankAccounts[0]);
      }
    } catch (error: any) {
      toast.error(error.message || 'Đã xảy ra lỗi');
      navigate('/cart/checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRef = () => {
    if (payment?.transactionRef) {
      navigator.clipboard.writeText(payment.transactionRef);
      toast.success('Đã copy mã giao dịch!');
    }
  };

  const handleConfirm = async () => {
    // Generate a demo transaction ref for sandbox
    const demoTransactionRef = `SANDBOX_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    setTransferRef(demoTransactionRef);
    setSubmitting(true);
    
    try {
      // Get token from the same source as other API calls
      const token = localStorage.getItem('auth_user');
      const accessToken = token ? JSON.parse(token)?.accessToken : null;

      // Simulate bank transfer delay (3 seconds for demo)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Auto-fill with demo transaction ref
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/payments/banking/confirm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            paymentId: payment?.paymentId,
            bankTransferRef: demoTransactionRef,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Xác nhận thất bại');
      }

      await response.json();
      toast.success('Thanh toán thành công! (Demo Mode)');
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
        <Link to="/cart/checkout" className="text-primary-600 hover:underline">
          Quay lại checkout
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEOMeta
        title="Xác nhận thanh toán chuyển khoản"
        description="Xác nhận thanh toán chuyển khoản ngân hàng"
      />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Thanh toán chuyển khoản ngân hàng</h1>

        {/* Transaction Reference */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Mã giao dịch của bạn</h2>
          <p className="text-sm text-blue-600 mb-2">
            Vui lòng ghi nhớ mã này và nhập vào nội dung chuyển khoản
          </p>
          <div className="flex items-center gap-4">
            <code className="flex-1 text-2xl font-mono font-bold text-blue-800 bg-white px-4 py-3 rounded-lg border border-blue-200">
              {payment.transactionRef}
            </code>
            <button
              onClick={handleCopyRef}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Copy
            </button>
          </div>
          <p className="text-sm text-blue-600 mt-3">
            Hạn sử dụng: {new Date(payment.expiresAt).toLocaleDateString('vi-VN')}
          </p>
        </div>

        {/* Amount to Transfer */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-green-900 mb-2">Số tiền cần chuyển</h2>
          <p className="text-3xl font-bold text-green-700">{formatPrice(payment.amount)}</p>
          <p className="text-sm text-green-600 mt-2">
            Đơn hàng: #{payment.orderNumber}
          </p>
        </div>

        {/* Bank Account Selection */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Chọn tài khoản nhận tiền</h2>

          {payment.bankAccounts && payment.bankAccounts.length > 0 ? (
            <div className="space-y-3">
              {payment.bankAccounts.map((bank) => (
                <label
                  key={bank.bankCode}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedBank?.bankCode === bank.bankCode
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="bank"
                    checked={selectedBank?.bankCode === bank.bankCode}
                    onChange={() => setSelectedBank(bank)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{bank.bankName}</p>
                    <p className="text-sm text-gray-600">
                      STK: {bank.maskedAccountNumber}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          navigator.clipboard.writeText(bank.accountNumber);
                          toast.success('Đã copy!');
                        }}
                        className="ml-2 text-primary-600 hover:underline"
                      >
                        Copy
                      </button>
                    </p>
                    <p className="text-sm text-gray-600">Tên: {bank.accountName}</p>
                    <p className="text-sm text-gray-600">Chi nhánh: {bank.branch}</p>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Không có thông tin tài khoản</p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-yellow-900 mb-4">Hướng dẫn</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
            <li>Chọn tài khoản ngân hàng bên trên</li>
            <li>Chuyển khoản với số tiền: <strong>{formatPrice(payment.amount)}</strong></li>
            <li>
              Nhập nội dung chuyển khoản: <strong className="font-mono">{payment.transactionRef}</strong>
            </li>
            <li>Sau khi chuyển khoản thành công, nhấn "Đã chuyển khoản" bên dưới</li>
          </ol>
        </div>

        {/* Confirm Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Xác nhận đã chuyển khoản</h2>
          <p className="text-sm text-gray-600 mb-4">
            Sau khi chuyển khoản thành công, nhập mã giao dịch từ SMS/Email xác nhận của ngân hàng:
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã giao dịch chuyển khoản (từ SMS/Email ngân hàng)
              </label>
              <input
                type="text"
                value={transferRef}
                onChange={(e) => setTransferRef(e.target.value.toUpperCase())}
                placeholder="Mã giao dịch sẽ được tự động tạo..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50"
                readOnly
              />
            </div>
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang xử lý thanh toán...
                </span>
              ) : (
                '🔄 Simulate Bank Transfer (Demo)'
              )}
            </button>
            <p className="text-xs text-center text-gray-500">
              Đây là chế độ demo - không cần chuyển khoản thật
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Đơn hàng sẽ được xử lý sau khi thanh toán thành công.
          </p>
          <Link to="/orders" className="text-primary-600 hover:underline mt-2 inline-block">
            Xem đơn hàng của tôi
          </Link>
        </div>
      </div>
    </>
  );
}
