// Enums
export type BookCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
export type ListingStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'SOLD' | 'HIDDEN';
export type ShippingOption = 'PICKUP' | 'DELIVERY' | 'BOTH';
export type SortOrder = 'asc' | 'desc';

// University
export interface University {
  id: number;
  name: string;
  shortName?: string;
  address?: string;
  website?: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    majors: number;
    users: number;
  };
}

// Major
export interface Major {
  id: number;
  name: string;
  code: string;
  universityId: number;
  university?: University;
  createdAt: string;
  updatedAt: string;
  _count?: {
    courses: number;
    books: number;
  };
}

// Course
export interface Course {
  id: number;
  name: string;
  code: string;
  majorId: number;
  semester?: number;
  year?: number;
  major?: Major;
  createdAt: string;
  updatedAt: string;
  _count?: {
    books: number;
    listings: number;
  };
}

// Category
export interface Category {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  parent?: Category;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    books: number;
  };
}

// Book
export interface Book {
  id: number;
  isbn?: string;
  title: string;
  author?: string;
  publisher?: string;
  edition?: string;
  publicationYear?: number;
  description?: string;
  coverImage?: string;
  condition?: BookCondition;
  majorId?: number;
  categoryId?: number;
  courseId?: number;
  major?: Major;
  category?: Category;
  course?: Course;
  images?: BookImage[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  _count?: {
    listings: number;
    favorites: number;
  };
}

export interface BookImage {
  id: number;
  bookId: number;
  url: string;
  isPrimary: boolean;
  order: number;
  createdAt: string;
}

// Listing
export interface Listing {
  id: number;
  bookId: number;
  sellerId: number;
  courseId?: number;
  price: number;
  quantity: number;
  status: ListingStatus;
  condition: BookCondition;
  description?: string;
  location?: string;
  shippingOption: ShippingOption;
  rejectionReason?: string;
  reviewedAt?: string;
  reviewerId?: number;
  book?: Book;
  seller?: User;
  course?: Course;
  images?: ListingImage[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  publishedAt?: string;
  _count?: {
    favorites: number;
  };
}

export interface ListingImage {
  id: number;
  listingId: number;
  url: string;
  isPrimary: boolean;
  order: number;
  createdAt: string;
}

// User
export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role?: 'USER' | 'ADMIN'; // For convenience check
  roles?: Array<{ id: number; name: string; description?: string }>;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';
  universityId?: number;
  university?: University;
  createdAt: string;
  updatedAt: string;
}

// Pagination
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Search Filters
export interface SearchFilters {
  q?: string;
  keyword?: string;
  universityId?: number;
  majorId?: number;
  courseId?: number;
  categoryId?: number;
  condition?: BookCondition;
  minPrice?: number;
  maxPrice?: number;
  sellerRating?: number;
  sortBy?: 'createdAt' | 'price' | 'updatedAt';
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

// Sort Options
export const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá thấp → cao' },
  { value: 'price_desc', label: 'Giá cao → thấp' },
  { value: 'sellerRating_desc', label: 'Đánh giá người bán' },
  { value: 'popular', label: 'Phổ biến' },
] as const;

// Condition Labels
export const CONDITION_LABELS: Record<BookCondition, string> = {
  NEW: 'Mới',
  LIKE_NEW: 'Như mới',
  GOOD: 'Tốt',
  FAIR: 'Khá',
  POOR: 'Cũ',
};

// Condition Colors
export const CONDITION_COLORS: Record<BookCondition, string> = {
  NEW: 'bg-green-100 text-green-800',
  LIKE_NEW: 'bg-emerald-100 text-emerald-800',
  GOOD: 'bg-blue-100 text-blue-800',
  FAIR: 'bg-yellow-100 text-yellow-800',
  POOR: 'bg-orange-100 text-orange-800',
};

// Status Labels
export const STATUS_LABELS: Record<ListingStatus, string> = {
  DRAFT: 'Nháp',
  PENDING_REVIEW: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  SOLD: 'Đã bán',
  HIDDEN: 'Ẩn',
};

// ============================================
// CART & ORDER TYPES
// ============================================

// Order Status
export type OrderStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'PREPARING' | 'SHIPPING' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';

// Payment Method
export type PaymentMethod = 'COD' | 'MOCK_ONLINE' | 'VNPAY_SANDBOX' | 'BANKING';

// Payment Status
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

// Payment Status Labels
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Chờ thanh toán',
  SUCCESS: 'Thành công',
  FAILED: 'Thất bại',
  CANCELLED: 'Đã hủy',
  REFUNDED: 'Đã hoàn tiền',
};

// Payment Status Colors
export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  SUCCESS: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  REFUNDED: 'bg-blue-100 text-blue-800',
};

// Order Status Labels
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  CONFIRMED: 'Đã xác nhận',
  PREPARING: 'Đang chuẩn bị',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  DISPUTED: 'Khiếu nại',
};

// Order Status Colors
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-indigo-100 text-indigo-800',
  SHIPPING: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800',
  DISPUTED: 'bg-orange-100 text-orange-800',
};

// Cart Item
export interface CartItem {
  id: number;
  userId: number;
  listingId: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  listing: Listing;
  price?: number;
  subtotal?: number;
}

// Cart
export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

// Order Item
export interface OrderItem {
  id: number;
  orderId: number;
  listingId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
  listing?: Listing;
}

// Order
export interface Order {
  id: number;
  orderNumber: string;
  buyerId: number;
  sellerId?: number;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
  status: OrderStatus;
  shippingAddress?: string;
  shippingPhone?: string;
  shippingName?: string;
  notes?: string;
  couponId?: number;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  buyer?: User;
  seller?: User;
  payments?: Payment[];
}

// Payment
export interface Payment {
  id: number;
  orderId: number;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  transactionId?: string;
  gatewayResponse?: {
    gatewayPaymentId: string;
    checkoutUrl: string;
    expiresAt: string;
  };
  failureReason?: string;
  paidAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Create Payment DTO
export interface CreatePaymentDto {
  orderId: number;
  method: PaymentMethod;
}

// Mock Payment Callback DTO
export interface MockPaymentCallbackDto {
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED';
  transactionId?: string;
  failureReason?: string;
  signature?: string;
}

// VNPAY Payment Types
export interface VnpayPaymentResult {
  paymentId: number;
  paymentUrl: string;
  txnRef: string;
  expiresAt: string;
}

export interface VnpayCallbackResult {
  success: boolean;
  message: string;
  orderId?: number;
  paymentId?: number;
  amount?: number;
  responseCode: string;
  txnRef?: string;
  transactionNo?: string;
}

// Create Order DTO
export interface CreateOrderDto {
  paymentMethod?: PaymentMethod;
  shippingAddress: string;
  shippingPhone: string;
  shippingName: string;
  notes?: string;
  couponCode?: string;
  // Legal compliance fields
  acceptedTermsVersion?: string;
  acceptedTermsAt?: string;
}

// Order Summary
export interface OrderSummary {
  orders: Order[];
  summary: {
    subtotal: number;
    discount: number;
    shippingFee: number;
    totalAmount: number;
  };
}

// ============================================
// WALLET & ESCROW TYPES (MOCK/SANDBOX)
// ============================================

// Transaction Types
export type WalletTransactionType = 'DEPOSIT' | 'ESCROW_HOLD' | 'ESCROW_RELEASE' | 'REFUND' | 'WITHDRAWAL';

// Escrow Status
export type EscrowStatus = 'CREATED' | 'FUNDED' | 'HELD' | 'RELEASED' | 'REFUNDED' | 'DISPUTED';

// Escrow Status Labels
export const ESCROW_STATUS_LABELS: Record<EscrowStatus, string> = {
  CREATED: 'Đã tạo',
  FUNDED: 'Đã thanh toán',
  HELD: 'Đang giữ',
  RELEASED: 'Đã giải ngân',
  REFUNDED: 'Đã hoàn tiền',
  DISPUTED: 'Khiếu nại',
};

// Escrow Status Colors
export const ESCROW_STATUS_COLORS: Record<EscrowStatus, string> = {
  CREATED: 'bg-gray-100 text-gray-800',
  FUNDED: 'bg-blue-100 text-blue-800',
  HELD: 'bg-yellow-100 text-yellow-800',
  RELEASED: 'bg-green-100 text-green-800',
  REFUNDED: 'bg-purple-100 text-purple-800',
  DISPUTED: 'bg-red-100 text-red-800',
};

// Wallet Transaction Type Labels
export const TRANSACTION_TYPE_LABELS: Record<WalletTransactionType, string> = {
  DEPOSIT: 'Nạp tiền',
  ESCROW_HOLD: 'Giữ escrow',
  ESCROW_RELEASE: 'Nhận tiền',
  REFUND: 'Hoàn tiền',
  WITHDRAWAL: 'Rút tiền',
};

// Wallet
export interface Wallet {
  id: number;
  balance: number;
  pendingEscrow: number;
  availableBalance: number;
  currency: string;
  isActive: boolean;
}

// Wallet Transaction
export interface WalletTransaction {
  id: number;
  type: WalletTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  referenceId: string | null;
  referenceType: string | null;
  createdAt: string;
}

// Escrow Transaction
export interface EscrowTransaction {
  id: number;
  orderId: number | null;
  sellerId: number;
  buyerId: number;
  amount: number;
  platformFee: number;
  netAmount: number;
  status: EscrowStatus;
  disputeReason: string | null;
  resolvedBy: number | null;
  resolvedAt: string | null;
  resolutionNote: string | null;
  createdAt: string;
  fundedAt: string | null;
  heldAt: string | null;
  releasedAt: string | null;
  refundedAt: string | null;
  order?: {
    id: number;
    orderNumber: string;
    buyer: {
      id: number;
      fullName: string;
      email: string;
    };
  };
  seller?: {
    id: number;
    fullName: string;
    email: string;
  };
  buyer?: {
    id: number;
    fullName: string;
    email: string;
  };
}

// ============================================
// REVIEW TYPES
// ============================================

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  PENDING: 'Đang chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  HIDDEN: 'Đã ẩn',
};

export const REVIEW_STATUS_COLORS: Record<ReviewStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  HIDDEN: 'bg-gray-100 text-gray-800',
};

export interface Review {
  id: number;
  orderId: number;
  reviewerId: number;
  targetUserId: number;
  rating: number;
  comment: string | null;
  response: string | null;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  reviewer?: {
    id: number;
    fullName: string;
    avatar?: string;
  };
  order?: {
    id: number;
    orderNumber: string;
  };
}

export interface SellerRating {
  userId: number;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationStatus = 'UNREAD' | 'READ' | 'ARCHIVED';

export const NOTIFICATION_STATUS_LABELS: Record<NotificationStatus, string> = {
  UNREAD: 'Chưa đọc',
  READ: 'Đã đọc',
  ARCHIVED: 'Đã lưu',
};

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  status: NotificationStatus;
  readAt: string | null;
  createdAt: string;
}

// ============================================
// COUPON TYPES
// ============================================

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  PERCENTAGE: 'Phần trăm',
  FIXED_AMOUNT: 'Số tiền cố định',
};

export interface Coupon {
  id: number;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  perUserLimit: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  usedCount: number;
}

export interface CouponValidation {
  valid: boolean;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  calculatedDiscount: number;
  message?: string;
}

// ============================================
// FAVORITE TYPES
// ============================================

export interface Favorite {
  id: number;
  listing: Listing;
  addedAt: string;
}
