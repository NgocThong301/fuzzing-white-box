import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { notificationApi } from '@/lib/api';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import type { Notification as AppNotification } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';

const NOTIFICATION_ICONS: Record<string, string> = {
  ORDER_PLACED: '📦',
  ORDER_CONFIRMED: '✅',
  ORDER_SHIPPING: '🚚',
  ORDER_DELIVERED: '📬',
  ORDER_COMPLETED: '🎉',
  PAYMENT_SUCCESS: '💳',
  PAYMENT_FAILED: '❌',
  REVIEW_RECEIVED: '⭐',
  REVIEW_APPROVED: '⭐',
  COUPON_EXPIRED: '🎟️',
  SYSTEM_ANNOUNCEMENT: '📢',
  DEFAULT: '🔔',
};

const getNotificationIcon = (type: string) => NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.DEFAULT;

const getNotificationLink = (notification: any): string | null => {
  if (!notification.data) return null;
  
  if (notification.data.orderId) {
    return `/orders/${notification.data.orderId}`;
  }
  if (notification.data.listingId) {
    return `/listings/${notification.data.listingId}`;
  }
  if (notification.data.reviewId && notification.data.orderId) {
    return `/orders/${notification.data.orderId}`;
  }
  return null;
};

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationApi.getAll({ page, limit: 20 }),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      toast.success('Đã đánh dấu tất cả là đã đọc');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => notificationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      toast.success('Đã xóa thông báo');
    },
  });

  const handleMarkAsRead = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    markAsReadMutation.mutate(id);
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Bạn có chắc muốn xóa thông báo này?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          title="Đã xảy ra lỗi"
          description="Không thể tải thông báo"
          icon="error"
        />
      </div>
    );
  }

  const notifications = data?.data || [];
  const meta = data?.meta;
  const unreadCount = meta?.unreadCount || 0;

  if (notifications.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
        </div>
        <EmptyState
          title="Không có thông báo nào"
          description="Các thông báo của bạn sẽ hiển thị ở đây"
          icon="bell"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
          {unreadCount > 0 && (
            <p className="text-gray-500 mt-1">{unreadCount} thông báo chưa đọc</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm divide-y">
        {notifications.map((notification: AppNotification) => {
          const isUnread = notification.status === 'UNREAD';
          const link = getNotificationLink(notification);
          const Icon = getNotificationIcon(notification.type);

          const content = (
            <div
              className={`p-4 flex gap-4 hover:bg-gray-50 transition-colors ${
                isUnread ? 'bg-blue-50/50' : ''
              }`}
            >
              <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                {Icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className={`font-medium ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2">
                {isUnread && (
                  <button
                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Đánh dấu đã đọc"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={(e) => handleDelete(notification.id, e)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Xóa thông báo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          );

          return link ? (
            <Link key={notification.id} to={link} className="block">
              {content}
            </Link>
          ) : (
            <div key={notification.id}>{content}</div>
          );
        })}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={!meta.hasPrev}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Trước
          </button>
          <span className="px-4 py-2">
            Trang {page} / {meta.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
            disabled={!meta.hasNext}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
