import { API_ENDPOINTS } from './endpoints';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export { API_BASE_URL };

type ApiParams = Record<string, string | number | boolean | undefined | null>;

// Get token from localStorage
function getAuthToken(): string | null {
  try {
    const storedAuth = localStorage.getItem('auth_user');
    if (storedAuth) {
      const authData = JSON.parse(storedAuth);
      return authData.accessToken || null;
    }
  } catch {
    // ignore
  }
  return null;
}

// Generic fetch function
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit & { params?: ApiParams }
): Promise<T> {
  const { params, ...fetchOptions } = options || {};
  
  let url = `${API_BASE_URL}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, params?: ApiParams) =>
    fetchApi<T>(endpoint, { method: 'GET', params }),
    
  post: <T>(endpoint: string, data?: unknown) =>
    fetchApi<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
    
  put: <T>(endpoint: string, data?: unknown) =>
    fetchApi<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
    
  patch: <T>(endpoint: string, data?: unknown) =>
    fetchApi<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
    
  delete: <T>(endpoint: string) =>
    fetchApi<T>(endpoint, { method: 'DELETE' }),
};

// University API
export const universityApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<{ data: import('../types').University[]; meta: import('../types').PaginationMeta }>(
      '/universities',
      params
    ),
  getById: (id: number) =>
    api.get<import('../types').University>(`/universities/${id}`),
};

// Major API
export const majorApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; universityId?: number }) =>
    api.get<{ data: import('../types').Major[]; meta: import('../types').PaginationMeta }>(
      '/majors',
      params
    ),
  getByUniversity: (universityId: number, params?: { page?: number; limit?: number; search?: string }) =>
    api.get<{ data: import('../types').Major[]; meta: import('../types').PaginationMeta }>(
      `/majors/university/${universityId}`,
      params
    ),
  getById: (id: number) =>
    api.get<import('../types').Major>(`/majors/${id}`),
};

// Course API
export const courseApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; majorId?: number; universityId?: number }) =>
    api.get<{ data: import('../types').Course[]; meta: import('../types').PaginationMeta }>(
      '/courses',
      params
    ),
  getByMajor: (majorId: number, params?: { page?: number; limit?: number; search?: string }) =>
    api.get<{ data: import('../types').Course[]; meta: import('../types').PaginationMeta }>(
      `/courses/major/${majorId}`,
      params
    ),
  getById: (id: number) =>
    api.get<import('../types').Course>(`/courses/${id}`),
};

// Category API
export const categoryApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; rootOnly?: boolean }) =>
    api.get<{ data: import('../types').Category[]; meta: import('../types').PaginationMeta }>(
      '/categories',
      params
    ),
  getTree: () =>
    api.get<import('../types').Category[]>('/categories/tree'),
  getById: (id: number) =>
    api.get<import('../types').Category>(`/categories/${id}`),
};

// Book API
export const bookApi = {
  getAll: (params?: { page?: number; limit?: number; q?: string; categoryId?: number; universityId?: number }) =>
    api.get<{ data: import('../types').Book[]; meta: import('../types').PaginationMeta }>(
      '/books',
      params
    ),
  getById: (id: number) =>
    api.get<import('../types').Book>(`/books/${id}`),
  getStats: () =>
    api.get<{ total: number; byCondition: { condition: string; count: number }[] }>('/books/stats'),
  create: (data: {
    title: string;
    isbn?: string;
    author?: string;
    publisher?: string;
    edition?: string;
    publicationYear?: number;
    description?: string;
    coverImage?: string;
    condition: import('../types').BookCondition;
    majorId?: number;
    categoryId?: number;
    courseId?: number;
  }) => api.post<import('../types').Book>('/books', data),
};

// Listing API
export const listingApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    q?: string;
    universityId?: number;
    majorId?: number;
    courseId?: number;
    categoryId?: number;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: string;
  }) =>
    api.get<{ data: import('../types').Listing[]; meta: import('../types').PaginationMeta }>(
      '/listings',
      params
    ),
  getById: (id: number) =>
    api.get<import('../types').Listing>(`/listings/${id}`),
  getMyListings: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<{ data: import('../types').Listing[]; meta: import('../types').PaginationMeta }>(
      '/listings/my',
      params
    ),
  create: (data: import('../types').Listing) =>
    api.post<import('../types').Listing>('/listings', data),
  update: (id: number, data: Partial<import('../types').Listing>) =>
    api.patch<import('../types').Listing>(`/listings/${id}`, data),
  delete: (id: number) =>
    api.delete<void>(`/listings/${id}`),
  submit: (id: number) =>
    api.post<import('../types').Listing>(`/listings/${id}/submit`),
  hide: (id: number) =>
    api.post<import('../types').Listing>(`/listings/${id}/hide`),
};

// Auth API
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<{ user: import('../types').User; accessToken: string }>(API_ENDPOINTS.auth.login, data),
  register: (data: { email: string; password: string; fullName: string }) =>
    api.post<{ user: import('../types').User }>(API_ENDPOINTS.auth.register, data),
  getMe: () =>
    api.get<import('../types').User>(API_ENDPOINTS.auth.me),
  logout: () =>
    api.post<void>(API_ENDPOINTS.auth.logout),
};

// Moderation API
export const moderationApi = {
  getListings: (params?: { page?: number; limit?: number; status?: string; q?: string }) =>
    api.get<{ data: import('../types').Listing[]; meta: import('../types').PaginationMeta }>(
      '/moderation/listings',
      params
    ),
  approve: (id: number) =>
    api.post<import('../types').Listing>(`/moderation/listings/${id}/approve`),
  reject: (id: number, reason: string) =>
    api.post<import('../types').Listing>(`/moderation/listings/${id}/reject`, { rejectionReason: reason }),
  getStats: () =>
    api.get<{ pending: number; approved: number; rejected: number; hidden: number }>('/moderation/stats'),
};

// Cart API
export const cartApi = {
  getCart: () =>
    api.get<import('../types').Cart>('/cart'),
  addItem: (data: { listingId: number; quantity?: number }) =>
    api.post<import('../types').CartItem>('/cart/items', data),
  updateItem: (listingId: number, data: { quantity: number }) =>
    api.put<import('../types').CartItem>(`/cart/items/${listingId}`, data),
  removeItem: (listingId: number) =>
    api.delete<{ success: boolean; message: string }>(`/cart/items/${listingId}`),
  clearCart: () =>
    api.delete<{ success: boolean; message: string }>('/cart'),
  validateCart: () =>
    api.post<{ valid: boolean; hasIssues: boolean; items: unknown[]; cart: import('../types').Cart }>('/cart/validate'),
};

// Order API
export const orderApi = {
  create: (data: import('../types').CreateOrderDto) =>
    api.post<import('../types').OrderSummary>('/orders', data),
  getMyOrders: (params?: { page?: number; limit?: number }) =>
    api.get<{ data: import('../types').Order[]; meta: import('../types').PaginationMeta }>(
      '/orders',
      params
    ),
  getSellerOrders: (params?: { page?: number; limit?: number }) =>
    api.get<{ data: import('../types').Order[]; meta: import('../types').PaginationMeta }>(
      '/orders/seller',
      params
    ),
  getById: (id: number) =>
    api.get<import('../types').Order>(`/orders/${id}`),
  updateStatus: (id: number, data: { status: import('../types').OrderStatus; reason?: string }) =>
    api.put<import('../types').Order>(`/orders/${id}/status`, data),
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get<{ data: import('../types').Order[]; meta: import('../types').PaginationMeta }>(
      '/admin/orders',
      params
    ),
};

// Payment API
export const paymentApi = {
  create: (data: import('../types').CreatePaymentDto) =>
    api.post<{ paymentId: number; checkoutUrl?: string; expiresAt?: string }>('/payments', data),
  getById: (id: number) =>
    api.get<import('../types').Payment>(`/payments/${id}`),
  getByOrderId: (orderId: number) =>
    api.get<import('../types').Payment[]>(`/payments/order/${orderId}`),
  mockCallback: (paymentId: number, data: import('../types').MockPaymentCallbackDto) =>
    api.post<{ success: boolean; message: string; payment: import('../types').Payment }>(
      `/payments/callback/${paymentId}`,
      data
    ),
  verify: (paymentId: number) =>
    api.post<{ valid: boolean; payment: import('../types').Payment; verifiedAt: string }>(
      `/payments/${paymentId}/verify`
    ),
};

// VNPAY Payment API
export const vnpayApi = {
  createPayment: (orderId: number) =>
    api.post<{ paymentId: number; paymentUrl: string; txnRef: string; expiresAt: string }>(
      '/payments/vnpay/create',
      { orderId }
    ),
};

// Wallet API
export const walletApi = {
  getWallet: () =>
    api.get<import('../types').Wallet>('/wallet'),
  getTransactions: (params?: { page?: number; limit?: number }) =>
    api.get<{ data: import('../types').WalletTransaction[]; meta: import('../types').PaginationMeta }>(
      '/wallet/transactions',
      params
    ),
  getEscrows: (status?: string) =>
    api.get<import('../types').EscrowTransaction[]>('/wallet/escrows', status ? { status } : undefined),
  getEscrowById: (id: number) =>
    api.get<import('../types').EscrowTransaction>(`/wallet/escrows/${id}`),
  disputeEscrow: (id: number, reason: string) =>
    api.post<{ success: boolean; escrow: import('../types').EscrowTransaction }>(
      `/wallet/escrows/${id}/dispute`,
      { reason }
    ),
};

// Admin Dispute API
export const disputeApi = {
  getDisputedEscrows: () =>
    api.get<import('../types').EscrowTransaction[]>('/admin/disputes'),
  resolveDispute: (escrowId: number, resolution: 'RELEASE' | 'REFUND', note?: string) =>
    api.post<{ success: boolean; resolution: string; releasedAmount?: number; refundedAmount?: number }>(
      `/admin/disputes/escrows/${escrowId}/resolve`,
      { resolution, note }
    ),
};

// Review API
export const reviewApi = {
  create: (data: { orderId: number; rating: number; comment?: string }) =>
    api.post<import('../types').Review>('/reviews', data),
  getMyRating: () =>
    api.get<import('../types').SellerRating>('/reviews/me/rating'),
  getMyReviews: (params?: { page?: number; limit?: number }) =>
    api.get<{ data: import('../types').Review[]; meta: import('../types').PaginationMeta }>(
      '/reviews/me/reviews',
      params
    ),
  getUserReviews: (userId: number, params?: { page?: number; limit?: number }) =>
    api.get<{ data: import('../types').Review[]; meta: import('../types').PaginationMeta }>(
      `/reviews/user/${userId}`,
      params
    ),
  getUserRating: (userId: number) =>
    api.get<import('../types').SellerRating>(`/reviews/user/${userId}/rating`),
  respond: (reviewId: number, response: string) =>
    api.post<import('../types').Review>(`/reviews/${reviewId}/respond`, { response }),
};

// Notification API
export const notificationApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get<{ data: import('../types').Notification[]; meta: import('../types').PaginationMeta & { unreadCount: number } }>(
      '/notifications',
      params
    ),
  getUnreadCount: () =>
    api.get<{ count: number }>('/notifications/unread-count'),
  markAsRead: (id: number) =>
    api.patch<void>(`/notifications/${id}/read`),
  markAllAsRead: () =>
    api.post<void>('/notifications/read-all'),
  delete: (id: number) =>
    api.delete<void>(`/notifications/${id}`),
};

// Coupon API
export const couponApi = {
  validate: (code: string, orderAmount: number) =>
    api.post<import('../types').CouponValidation>('/coupons/validate', { code, orderAmount }),
};

// Favorite API
export const favoriteApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get<{ data: import('../types').Favorite[]; meta: import('../types').PaginationMeta }>(
      '/favorites',
      params
    ),
  add: (listingId: number) =>
    api.post<import('../types').Favorite>(`/favorites/${listingId}`),
  remove: (listingId: number) =>
    api.delete<void>(`/favorites/${listingId}`),
  toggle: (listingId: number) =>
    api.post<{ favorited: boolean }>(`/favorites/${listingId}/toggle`),
  check: (listingId: number) =>
    api.get<{ isFavorited: boolean }>(`/favorites/${listingId}/check`),
};

// Recommendation API
export const recommendationApi = {
  getPersonalized: (params?: { limit?: number }) =>
    api.get<unknown>('/recommendations', params),
  getTrending: (params?: { limit?: number }) =>
    api.get<unknown[]>('/recommendations/trending', params),
  getSimilar: (listingId: number, params?: { limit?: number }) =>
    api.get<unknown[]>(`/recommendations/similar/${listingId}`, params),
};

// Admin API
export const adminApi = {
  // Dashboard
  getDashboardStats: () =>
    api.get<{
      users: { total: number; sellers: number; buyers: number };
      listings: { total: number; pending: number };
      orders: { total: number; processing: number };
      revenue: { total: number };
      transactions: { total: number };
      escrow: { pending: number };
      disputes: { pending: number };
    }>('/admin/dashboard/stats'),
  getRevenueByDay: (days?: number) =>
    api.get<{ date: string; amount: number }[]>('/admin/dashboard/revenue-by-day', days ? { days } : undefined),
  getOrdersByDay: (days?: number) =>
    api.get<{ date: string; count: number }[]>('/admin/dashboard/orders-by-day', days ? { days } : undefined),
  getUserRegistrationsByDay: (days?: number) =>
    api.get<{ date: string; count: number }[]>('/admin/dashboard/user-registrations-by-day', days ? { days } : undefined),
  getListingsByDay: (days?: number) =>
    api.get<{ date: string; count: number }[]>('/admin/dashboard/listings-by-day', days ? { days } : undefined),
  getTopCategories: (limit?: number) =>
    api.get<{ categoryId: number; categoryName: string; count: number }[]>('/admin/dashboard/top-categories', limit ? { limit } : undefined),
  getTopCourses: (limit?: number) =>
    api.get<{ courseId: number; courseName: string; count: number }[]>('/admin/dashboard/top-courses', limit ? { limit } : undefined),
  // Users
  getUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<{ data: any[]; meta: import('../types').PaginationMeta }>('/admin/users', params),
  deactivateUser: (id: number, reason: string) =>
    api.post<void>(`/admin/users/${id}/deactivate`, { reason }),
  // Listings
  getListings: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    api.get<{ data: any[]; meta: import('../types').PaginationMeta }>('/admin/listings', params),
  editListing: (id: number, data: {
    title?: string;
    author?: string;
    publisher?: string;
    isbn?: string;
    edition?: string;
    publicationYear?: number;
    categoryId?: number;
    price?: string;
    quantity?: number;
    condition?: string;
    description?: string;
    location?: string;
    shippingOption?: string;
  }) =>
    api.patch<any>(`/admin/listings/${id}`, data),
  // Orders
  getOrders: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<{ data: any[]; meta: import('../types').PaginationMeta }>('/admin/orders', params),
  // Payments
  getPayments: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<{ data: any[]; meta: import('../types').PaginationMeta }>('/admin/payments', params),
  // Reviews
  getReviews: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<{ data: any[]; meta: import('../types').PaginationMeta }>('/admin/reviews', params),
  // Reports
  getReports: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<{ data: any[]; meta: import('../types').PaginationMeta }>('/admin/reports', params),
  resolveReport: (id: number, action: 'RESOLVED' | 'DISMISSED', note?: string) =>
    api.post<any>(`/admin/reports/${id}/resolve`, { action, note }),
};
