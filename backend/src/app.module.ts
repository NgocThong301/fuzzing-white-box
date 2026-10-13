import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './common/prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { AcademicModule } from './modules/academic/academic.module';
import { CategoryModule } from './modules/category/category.module';
import { BookModule } from './modules/book/book.module';
import { ListingModule } from './modules/listing/listing.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { PaymentModule } from './modules/payment/payment.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { ReviewModule } from './modules/review/review.module';
import { NotificationModule } from './modules/notification/notification.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { RecommendationModule } from './modules/recommendation/recommendation.module';
import { AdminModule } from './modules/admin/admin.module';
import { SEOModule } from './modules/seo/seo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 1 minute
        limit: 10,
      },
    ]),
    PrismaModule,
    HealthModule,
    AuthModule,
    AcademicModule,
    CategoryModule,
    BookModule,
    ListingModule,
    ModerationModule,
    CartModule,
    OrderModule,
    PaymentModule,
    WalletModule,
    NotificationModule,
    ReviewModule,
    CouponModule,
    FavoriteModule,
    RecommendationModule,
    AdminModule,
    SEOModule,
  ],
})
export class AppModule {}
