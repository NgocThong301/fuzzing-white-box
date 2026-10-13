/**
 * NOTIFICATION SERVICE
 * ====================
 * 
 * Xử lý thông báo cho user
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { NotificationStatus, NotificationType } from '@prisma/client';

export interface CreateNotificationDto {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo thông báo mới
   */
  async createNotification(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        data: dto.data || undefined,
        status: NotificationStatus.UNREAD,
      },
    });
  }

  /**
   * Lấy notifications của user
   */
  async getNotifications(userId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({
        where: { userId, status: NotificationStatus.UNREAD },
      }),
    ]);

    return {
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        unreadCount,
      },
    };
  }

  /**
   * Lấy số thông báo chưa đọc
   */
  async getUnreadCount(userId: number) {
    return this.prisma.notification.count({
      where: { userId, status: NotificationStatus.UNREAD },
    });
  }

  /**
   * Đánh dấu đã đọc
   */
  async markAsRead(notificationId: number, userId: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      return; // Ignore if not owned
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });
  }

  /**
   * Đánh dấu tất cả đã đọc
   */
  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: { userId, status: NotificationStatus.UNREAD },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });
  }

  /**
   * Xóa thông báo
   */
  async deleteNotification(notificationId: number, userId: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }
}
