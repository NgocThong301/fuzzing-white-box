/**
 * Multi-Step Checkout Page
 *
 * Flow:
 * 1. Review products
 * 2. Enter shipping info
 * 3. Review order & select payment
 * 4. Confirm & place order
 * 5. Show result
 *
 * Saves: order confirmation timestamp, accepted terms version
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { cartApi, orderApi, couponApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { CreateOrderDto, CouponValidation } from '../../types';
import { LoadingSpinner } from '../../components/shared';
import { toast } from 'sonner';
import SEOMeta from '../../components/seo/SEOMeta';

const TERMS_VERSION = '1.0';

interface ShippingInfo {
  name: string;
  phone: string;
  address: string;
  notes: string;
}

type CheckoutPaymentMethod = 'cod' | 'vnpay';

interface CheckoutState {
  step: number;
  shippingInfo: ShippingInfo | null;
  acceptedTerms: boolean;
  termsVersion: string;
  confirmedAt: string | null;
  paymentMethod: CheckoutPaymentMethod;
  couponCode: string;
  couponValidation: CouponValidation | null;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Checkout state
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    step: 1,
    shippingInfo: null,
    acceptedTerms: false,
    termsVersion: TERMS_VERSION,
    confirmedAt: null,
    paymentMethod: 'cod',
    couponCode: '',
    couponValidation: null,
  });

  const [shippingForm, setShippingForm] = useState<ShippingInfo>({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  // Prevent double click
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch cart - include userId in queryKey for per-user caching
  const { data: cart, isLoading: cartLoading } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => cartApi.getCart(),
    enabled: !!user,
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: CreateOrderDto) => {
      try {
        const result = await orderApi.create(data);
        return result;
      } catch (error: any) {
        console.log('Order creation failed:', error?.response?.data);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success('Đặt hàng thành công!');
      navigate('/orders/success', {
        state: {
          orders: data.orders,
          summary: data.summary,
          orderDetails: {
            orderNumber: data.orders[0]?.orderNumber,
            confirmedAt: checkoutState.confirmedAt,
            termsVersion: checkoutState.termsVersion,
          },
        },
      });
    },
    onError: (error: any) => {
      console.error('Order creation error:', error);
      const message = error?.response?.data?.message || error.message || 'Đặt hàng thất bại';
      toast.error(message);
      setCheckoutState(prev => ({ ...prev, step: 4 }));
      setIsProcessing(false);
    },
  });

  // Create VNPAY payment mutation
  const createVnpayMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const token = localStorage.getItem('auth_user');
      const accessToken = token ? JSON.parse(token)?.accessToken : null;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/payments/vnpay/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ orderId }),
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Không thể tạo thanh toán VNPAY');
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to VNPAY payment page
      window.location.href = data.paymentUrl;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể tạo thanh toán VNPAY');
      setIsProcessing(false);
    },
  });

  // Coupon validation mutation
  const validateCouponMutation = useMutation({
    mutationFn: (code: string) => couponApi.validate(code, subtotal),
    onSuccess: (data) => {
      if (data.valid) {
        setCheckoutState(prev => ({
          ...prev,
          couponValidation: data,
          couponCode: data.code,
        }));
        toast.success('Áp dụng mã giảm giá thành công!');
      } else {
        toast.error(data.message || 'Mã giảm giá không hợp lệ');
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Mã giảm giá không hợp lệ';
      toast.error(message);
    },
  });

  const handleApplyCoupon = () => {
    if (!checkoutState.couponCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }
    validateCouponMutation.mutate(checkoutState.couponCode.trim());
  };

  const handleRemoveCoupon = () => {
    setCheckoutState(prev => ({
      ...prev,
      couponCode: '',
      couponValidation: null,
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate totals
  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const shippingFee = 30000;
  const discountAmount = checkoutState.couponValidation?.calculatedDiscount || 0;
  const total = subtotal + shippingFee - discountAmount;
  
  // Step navigation
  const goToStep = (step: number) => {
    if (step === 3 && (!shippingForm.name || !shippingForm.phone || !shippingForm.address)) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }
    if (step === 3 && !checkoutState.shippingInfo) {
      setCheckoutState(prev => ({
        ...prev,
        shippingInfo: shippingForm,
      }));
    }
    setCheckoutState(prev => ({ ...prev, step }));
  };

  // Handle order confirmation
  const handleConfirmOrder = async () => {
    if (isProcessing || createOrderMutation.isPending) return;
    setIsProcessing(true);

    if (!checkoutState.acceptedTerms) {
      toast.error('Vui lòng đồng ý với điều khoản sử dụng');
      setIsProcessing(false);
      return;
    }

    if (!checkoutState.shippingInfo) {
      toast.error('Vui lòng nhập thông tin giao hàng');
      setIsProcessing(false);
      return;
    }

    const confirmedAt = new Date().toISOString();
    const paymentMethod = checkoutState.paymentMethod === 'vnpay' ? 'VNPAY_SANDBOX' : 'COD';

    try {
      // Create order data
      const orderData: CreateOrderDto = {
        shippingAddress: checkoutState.shippingInfo.address,
        shippingPhone: checkoutState.shippingInfo.phone,
        shippingName: checkoutState.shippingInfo.name,
        notes: checkoutState.shippingInfo.notes || undefined,
        couponCode: checkoutState.couponValidation?.code,
        paymentMethod: paymentMethod as any,
        acceptedTermsVersion: TERMS_VERSION,
        acceptedTermsAt: confirmedAt,
      };

      // For banking/VNPAY: Set step 5 first, then create order (redirect after)
      if (checkoutState.paymentMethod === 'vnpay') {
        setCheckoutState(prev => ({ ...prev, step: 5, confirmedAt }));
        const result = await orderApi.create(orderData);
        const orderId = result.orders[0]?.id;
        if (orderId) {
          await createVnpayMutation.mutateAsync(orderId);
        }
      } else {
        // For COD: Create order first, onSuccess will navigate to success page
        // Keep at step 4 with loading state from mutation
        await createOrderMutation.mutateAsync(orderData);
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Đặt hàng thất bại';
      toast.error(message);
      setCheckoutState(prev => ({ ...prev, step: 4 }));
      setIsProcessing(false);
    }
  };

  // Loading state
  if (cartLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h1>
        <p className="text-gray-500 mb-8">Vui lòng thêm sản phẩm vào giỏ hàng trước</p>
        <Link
          to="/search"
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors inline-block"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEOMeta
        title="Thanh toán"
        description="Hoàn tất đơn hàng của bạn"
      />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[
              { num: 1, label: 'Xem sản phẩm' },
              { num: 2, label: 'Thông tin giao hàng' },
              { num: 3, label: 'Xem lại đơn hàng' },
              { num: 4, label: 'Thanh toán' },
              { num: 5, label: 'Hoàn tất' },
            ].map((step, index) => (
              <div key={step.num} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-colors ${
                    checkoutState.step >= step.num
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {checkoutState.step > step.num ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.num
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium hidden sm:block ${
                  checkoutState.step >= step.num ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
                {index < 4 && (
                  <div className={`w-8 sm:w-16 h-1 mx-2 ${
                    checkoutState.step > step.num ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Review Products */}
        {checkoutState.step === 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Bước 1: Xem sản phẩm</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.listing.images?.[0] ? (
                      <img
                        src={item.listing.images[0].url}
                        alt={item.listing.book?.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">📚</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.listing.book?.title}</h3>
                    <p className="text-sm text-gray-500">{item.listing.book?.author}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm">Số lượng: {item.quantity}</span>
                      <span className="font-semibold text-primary-600">
                        {formatPrice(item.subtotal || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <Link
                to="/cart"
                className="text-primary-600 hover:text-primary-700"
              >
                ← Quay lại giỏ hàng
              </Link>
              <button
                onClick={() => goToStep(2)}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
              >
                Tiếp tục →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Enter Shipping Info */}
        {checkoutState.step === 2 && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Bước 2: Thông tin giao hàng</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên người nhận <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={shippingForm.name}
                    onChange={(e) => setShippingForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={shippingForm.phone}
                    onChange={(e) => setShippingForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="0909123456"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ giao hàng <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={shippingForm.address}
                    onChange={(e) => setShippingForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="123 Nguyễn Trãi, Quận 1, TP.HCM"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    value={shippingForm.notes}
                    onChange={(e) => setShippingForm(f => ({ ...f, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Giao giờ hành chính..."
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="bg-gray-50 rounded-lg p-6 h-fit">
              <h3 className="font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h3>
              
              {/* Coupon Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã giảm giá
                </label>
                {checkoutState.couponValidation ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-green-700 font-medium">{checkoutState.couponCode}</span>
                      <span className="text-green-600 text-sm ml-2">
                        -{formatPrice(checkoutState.couponValidation.calculatedDiscount)}
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Xóa mã giảm giá"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={checkoutState.couponCode}
                      onChange={(e) => setCheckoutState(prev => ({ ...prev, couponCode: e.target.value.toUpperCase() }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 uppercase"
                      placeholder="Nhập mã..."
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={validateCouponMutation.isPending || !checkoutState.couponCode.trim()}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400"
                    >
                      {validateCouponMutation.isPending ? '...' : 'Áp dụng'}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Số sản phẩm:</span>
                  <span>{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá:</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Tổng:</span>
                  <span className="text-primary-600">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-between">
              <button
                onClick={() => goToStep(1)}
                className="text-primary-600 hover:text-primary-700"
              >
                ← Quay lại
              </button>
              <button
                onClick={() => goToStep(3)}
                disabled={!shippingForm.name || !shippingForm.phone || !shippingForm.address}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-400"
              >
                Tiếp tục →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review Order */}
        {checkoutState.step === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Bước 3: Xem lại đơn hàng</h2>
              
              {/* Shipping Info Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Thông tin giao hàng</h3>
                <p className="text-gray-600">
                  <strong>Người nhận:</strong> {checkoutState.shippingInfo?.name}
                </p>
                <p className="text-gray-600">
                  <strong>Điện thoại:</strong> {checkoutState.shippingInfo?.phone}
                </p>
                <p className="text-gray-600">
                  <strong>Địa chỉ:</strong> {checkoutState.shippingInfo?.address}
                </p>
                {checkoutState.shippingInfo?.notes && (
                  <p className="text-gray-600">
                    <strong>Ghi chú:</strong> {checkoutState.shippingInfo.notes}
                  </p>
                )}
                <button
                  onClick={() => goToStep(2)}
                  className="text-primary-600 text-sm mt-2 hover:underline"
                >
                  Chỉnh sửa
                </button>
              </div>

              {/* Products */}
              <h3 className="font-medium text-gray-900 mb-3">Sản phẩm đặt mua</h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 border border-gray-200 rounded-lg">
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                      {item.listing.images?.[0] ? (
                        <img src={item.listing.images[0].url} alt={item.listing.book?.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">📚</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.listing.book?.title}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} x {formatPrice(item.price || 0)}
                      </p>
                    </div>
                    <p className="font-medium">{formatPrice(item.subtotal || 0)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t mt-6 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính ({items.length} sản phẩm)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>Tổng cộng</span>
                  <span className="text-primary-600">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => goToStep(2)}
                className="text-primary-600 hover:text-primary-700"
              >
                ← Quay lại
              </button>
              <button
                onClick={() => goToStep(4)}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
              >
                Tiếp tục thanh toán →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Payment */}
        {checkoutState.step === 4 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Bước 4: Chọn phương thức thanh toán & Xác nhận
              </h2>

              {/* Payment Methods */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Phương thức thanh toán</h3>
                <div className="space-y-2">
                  <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    checkoutState.paymentMethod === 'cod' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={checkoutState.paymentMethod === 'cod'}
                      onChange={() => setCheckoutState(prev => ({ ...prev, paymentMethod: 'cod' }))}
                      className="mr-3"
                    />
                    <span className="flex-1">
                      <span className="font-medium">Thanh toán khi nhận hàng (COD)</span>
                      <span className="text-sm text-gray-500 ml-2">(Khuyến nghị)</span>
                    </span>
                    <span className="text-2xl">💵</span>
                  </label>

                  <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    checkoutState.paymentMethod === 'vnpay' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="vnpay"
                      checked={checkoutState.paymentMethod === 'vnpay'}
                      onChange={() => setCheckoutState(prev => ({ ...prev, paymentMethod: 'vnpay' }))}
                      className="mr-3"
                    />
                    <span className="flex-1">
                      <span className="font-medium">Thanh toán qua VNPAY</span>
                      <span className="text-sm text-gray-500 ml-2">(Sandbox)</span>
                    </span>
                    <span className="text-2xl">💳</span>
                  </label>
                </div>
              </div>

              {/* Total */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between text-xl font-bold">
                  <span>Thành tiền</span>
                  <span className="text-primary-600">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Terms Acceptance */}
              <div className="border-t pt-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkoutState.acceptedTerms}
                    onChange={(e) => setCheckoutState(prev => ({ ...prev, acceptedTerms: e.target.checked }))}
                    className="mt-1 w-5 h-5 text-primary-600 rounded"
                  />
                  <div className="text-sm text-gray-600">
                    <p>
                      Tôi đã đọc và đồng ý với{' '}
                      <Link to="/terms" className="text-primary-600 hover:underline">Điều khoản sử dụng</Link>,{' '}
                      <Link to="/privacy-policy" className="text-primary-600 hover:underline">Chính sách bảo mật</Link>.
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Phiên bản điều khoản: {TERMS_VERSION}
                    </p>
                  </div>
                </label>
              </div>

              {/* Sandbox Warning */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⚠️ <strong>MÔI TRƯỜNG MÔ PHỎNG:</strong> Đây là bài tập sinh viên. 
                  Không có tiền thật trong giao dịch này.
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => goToStep(3)}
                className="text-primary-600 hover:text-primary-700"
              >
                ← Quay lại
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={
                  !checkoutState.acceptedTerms ||
                  createOrderMutation.isPending ||
                  createVnpayMutation.isPending ||
                  isProcessing
                }
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
              >
                {createOrderMutation.isPending || createVnpayMutation.isPending || isProcessing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang xử lý...
                  </span>
                ) : checkoutState.paymentMethod === 'vnpay' ? (
                  `Thanh toán qua VNPAY - ${formatPrice(total)}`
                ) : (
                  `Xác nhận đặt hàng - ${formatPrice(total)}`
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Processing */}
        {checkoutState.step === 5 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="animate-spin w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {checkoutState.paymentMethod === 'vnpay' ? 'Đang chuyển hướng...' : 'Đang xử lý đơn hàng...'}
            </h2>
            <p className="text-gray-500">
              Vui lòng chờ trong giây lát
            </p>
          </div>
        )}
      </div>
    </>
  );
}
