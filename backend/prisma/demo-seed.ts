/**
 * DEMO SEED - SachGiaRe.vn
 * 
 * Creates stable demo data for video presentation (5-10 minutes)
 * All data is fictional and suitable for public demonstration.
 * 
 * Run: npx prisma db seed
 */

import { PrismaClient, UserStatus, RoleType, ListingStatus, OrderStatus, PaymentMethod, PaymentStatus, EscrowStatus, NotificationType, NotificationStatus, ReportStatus, BookCondition, ShippingOption } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Demo password for all accounts
const DEMO_PASSWORD = 'Demo123!';

async function main() {
  console.log('🎬 Starting DEMO seed...');
  console.log('='.repeat(50));

  // ============================================
  // CLEANUP
  // ============================================
  console.log('🧹 Cleaning existing data...');
  
  await prisma.auditLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.escrowTransaction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.book.deleteMany();
  await prisma.category.deleteMany();
  await prisma.course.deleteMany();
  await prisma.major.deleteMany();
  await prisma.university.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  
  console.log('✅ Cleanup completed');

  // ============================================
  // ROLES
  // ============================================
  console.log('\n👥 Creating roles...');
  
  const adminRole = await prisma.role.create({
    data: { name: RoleType.ADMIN, description: 'Administrator' },
  });
  const moderatorRole = await prisma.role.create({
    data: { name: RoleType.MODERATOR, description: 'Content Moderator' },
  });
  const sellerRole = await prisma.role.create({
    data: { name: RoleType.SELLER, description: 'Book Seller' },
  });
  const buyerRole = await prisma.role.create({
    data: { name: RoleType.BUYER, description: 'Book Buyer' },
  });
  const userRole = await prisma.role.create({
    data: { name: RoleType.USER, description: 'Standard User' },
  });

  console.log('✅ Roles created');

  // ============================================
  // UNIVERSITIES
  // ============================================
  console.log('\n🏛️ Creating universities...');
  
  const hcmut = await prisma.university.create({
    data: {
      name: 'Đại học Bách Khoa TP.HCM',
      shortName: 'HCMUT',
      address: '268 Lý Thường Kiệt, Quận 10, TP.HCM',
      website: 'https://hcmut.edu.vn',
    },
  });

  const ueh = await prisma.university.create({
    data: {
      name: 'Đại học Kinh tế TP.HCM',
      shortName: 'UEH',
      address: '59C Nguyễn Đình Chiểu, Quận 1, TP.HCM',
      website: 'https://ueh.edu.vn',
    },
  });

  const hcmus = await prisma.university.create({
    data: {
      name: 'Đại học Khoa học Tự nhiên TP.HCM',
      shortName: 'HCMUS',
      address: '227 Nguyễn Văn Cừ, Quận 5, TP.HCM',
      website: 'https://hcmus.edu.vn',
    },
  });

  console.log(`✅ Created ${3} universities`);

  // ============================================
  // MAJORS
  // ============================================
  console.log('\n📚 Creating majors...');
  
  const ctk = await prisma.major.create({
    data: { name: 'Kỹ thuật Máy tính', code: 'CTK', universityId: hcmut.id },
  });
  const cntt = await prisma.major.create({
    data: { name: 'Công nghệ Thông tin', code: 'CNTT', universityId: hcmus.id },
  });
  const kt = await prisma.major.create({
    data: { name: 'Kinh tế', code: 'KT', universityId: ueh.id },
  });

  console.log(`✅ Created ${3} majors`);

  // ============================================
  // COURSES
  // ============================================
  console.log('\n📖 Creating courses...');
  
  const cs101 = await prisma.course.create({
    data: { name: 'Nhập môn Lập trình', code: 'CS101', majorId: ctk.id, semester: 1, year: 2026 },
  });
  const cs102 = await prisma.course.create({
    data: { name: 'Cấu trúc Dữ liệu', code: 'CS102', majorId: ctk.id, semester: 2, year: 2026 },
  });
  const math101 = await prisma.course.create({
    data: { name: 'Giải tích 1', code: 'MATH101', majorId: ctk.id, semester: 1, year: 2026 },
  });
  const eco101 = await prisma.course.create({
    data: { name: 'Kinh tế Vi mô', code: 'ECO101', majorId: kt.id, semester: 1, year: 2026 },
  });

  console.log(`✅ Created ${4} courses`);

  // ============================================
  // CATEGORIES
  // ============================================
  console.log('\n📂 Creating categories...');
  
  const catCs = await prisma.category.create({
    data: { name: 'Khoa học Máy tính', description: 'Sách về CNTT và lập trình' },
  });
  const catKt = await prisma.category.create({
    data: { name: 'Kinh tế', description: 'Sách kinh tế, tài chính' },
  });
  const catToan = await prisma.category.create({
    data: { name: 'Toán học', description: 'Sách toán cao cấp' },
  });
  const catLy = await prisma.category.create({
    data: { name: 'Vật lý', description: 'Sách vật lý đại cương' },
  });

  console.log(`✅ Created ${4} categories`);

  // ============================================
  // BOOKS
  // ============================================
  console.log('\n📚 Creating books...');
  
  const book1 = await prisma.book.create({
    data: {
      isbn: '978-0134685991',
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen',
      publisher: 'MIT Press',
      edition: '3rd Edition',
      publicationYear: 2009,
      description: 'Sách giáo trình kinh điển về thuật toán',
      condition: BookCondition.LIKE_NEW,
      categoryId: catCs.id,
    },
  });

  const book2 = await prisma.book.create({
    data: {
      isbn: '978-0596517748',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      publisher: "O'Reilly Media",
      edition: '1st Edition',
      publicationYear: 2008,
      description: 'Cuốn sách về viết code sạch',
      condition: BookCondition.GOOD,
      categoryId: catCs.id,
    },
  });

  const book3 = await prisma.book.create({
    data: {
      isbn: '978-0321573513',
      title: 'Algorithms 4th Edition',
      author: 'Robert Sedgewick',
      publisher: 'Addison-Wesley',
      edition: '4th Edition',
      publicationYear: 2011,
      description: 'Thuật toán nâng cao',
      condition: BookCondition.GOOD,
      categoryId: catCs.id,
    },
  });

  const book4 = await prisma.book.create({
    data: {
      isbn: '978-1305270107',
      title: 'Principles of Economics',
      author: 'N. Gregory Mankiw',
      publisher: 'Cengage',
      edition: '8th Edition',
      publicationYear: 2017,
      description: 'Nguyên lý kinh tế',
      condition: BookCondition.LIKE_NEW,
      categoryId: catKt.id,
    },
  });

  const book5 = await prisma.book.create({
    data: {
      isbn: '978-0321909108',
      title: 'University Physics',
      author: 'Young & Freedman',
      publisher: 'Pearson',
      edition: '14th Edition',
      publicationYear: 2015,
      description: 'Vật lý đại cương',
      condition: BookCondition.FAIR,
      categoryId: catLy.id,
    },
  });

  console.log(`✅ Created ${5} books`);

  // ============================================
  // DEMO USERS
  // ============================================
  console.log('\n👤 Creating demo users...');
  
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // ADMIN
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@demo.local',
      passwordHash,
      fullName: 'Admin Demo',
      phone: '0900000001',
      status: UserStatus.ACTIVE,
      universityId: hcmut.id,
      reputationScore: 5.0,
      totalSales: 150,
      responseRate: 100,
    },
  });
  await prisma.userRole.createMany({
    data: [
      { userId: adminUser.id, roleId: adminRole.id },
      { userId: adminUser.id, roleId: userRole.id },
    ],
  });
  await prisma.wallet.create({
    data: { userId: adminUser.id, balance: 10000000, currency: 'VND' },
  });

  // MODERATOR
  const modUser = await prisma.user.create({
    data: {
      email: 'moderator@demo.local',
      passwordHash,
      fullName: 'Moderator Demo',
      phone: '0900000002',
      status: UserStatus.ACTIVE,
      universityId: hcmut.id,
      reputationScore: 4.8,
      totalSales: 45,
      responseRate: 95,
    },
  });
  await prisma.userRole.createMany({
    data: [
      { userId: modUser.id, roleId: moderatorRole.id },
      { userId: modUser.id, roleId: userRole.id },
    ],
  });
  await prisma.wallet.create({
    data: { userId: modUser.id, balance: 500000, currency: 'VND' },
  });

  // SELLER
  const sellerUser = await prisma.user.create({
    data: {
      email: 'seller@demo.local',
      passwordHash,
      fullName: 'Nguyễn Văn Bán Sách',
      phone: '0900000003',
      status: UserStatus.ACTIVE,
      universityId: hcmut.id,
      reputationScore: 4.5,
      totalSales: 23,
      responseRate: 88,
    },
  });
  await prisma.userRole.createMany({
    data: [
      { userId: sellerUser.id, roleId: sellerRole.id },
      { userId: sellerUser.id, roleId: buyerRole.id },
      { userId: sellerUser.id, roleId: userRole.id },
    ],
  });
  await prisma.wallet.create({
    data: { userId: sellerUser.id, balance: 2500000, currency: 'VND' },
  });

  // BUYER
  const buyerUser = await prisma.user.create({
    data: {
      email: 'buyer@demo.local',
      passwordHash,
      fullName: 'Trần Thị Mua Sách',
      phone: '0900000004',
      status: UserStatus.ACTIVE,
      universityId: ueh.id,
      reputationScore: 4.2,
      totalSales: 5,
      responseRate: 100,
    },
  });
  await prisma.userRole.createMany({
    data: [
      { userId: buyerUser.id, roleId: buyerRole.id },
      { userId: buyerUser.id, roleId: userRole.id },
    ],
  });
  await prisma.wallet.create({
    data: { userId: buyerUser.id, balance: 5000000, currency: 'VND' },
  });

  console.log('✅ Created demo users:');
  console.log('   admin@demo.local');
  console.log('   moderator@demo.local');
  console.log('   seller@demo.local');
  console.log('   buyer@demo.local');
  console.log(`   Password: ${DEMO_PASSWORD}`);

  // ============================================
  // LISTINGS
  // ============================================
  console.log('\n📦 Creating listings...');
  
  // APPROVED LISTINGS (for browsing and buying)
  const listing1 = await prisma.listing.create({
    data: {
      bookId: book1.id,
      sellerId: sellerUser.id,
      courseId: cs102.id,
      price: 350000,
      quantity: 2,
      condition: BookCondition.LIKE_NEW,
      description: 'Sách mới, chưa sử dụng. Bìa còn đẹp, nội dung sạch sẽ. Mua từ đầu năm nhưng không học môn này.',
      location: 'TP.HCM, Quận 10',
      shippingOption: ShippingOption.BOTH,
      status: ListingStatus.APPROVED,
      publishedAt: new Date(),
      images: {
        create: [{ url: 'https://picsum.photos/seed/algo1/400/600', isPrimary: true }],
      },
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      bookId: book2.id,
      sellerId: sellerUser.id,
      price: 280000,
      quantity: 1,
      condition: BookCondition.GOOD,
      description: 'Sách đã sử dụng 1 học kỳ. Có ghi chú bằng bút chì ở lề (có thể xóa được).',
      location: 'TP.HCM, Quận 10',
      shippingOption: ShippingOption.PICKUP,
      status: ListingStatus.APPROVED,
      publishedAt: new Date(),
      images: {
        create: [{ url: 'https://picsum.photos/seed/cleancode/400/600', isPrimary: true }],
      },
    },
  });

  const listing3 = await prisma.listing.create({
    data: {
      bookId: book4.id,
      sellerId: sellerUser.id,
      courseId: eco101.id,
      price: 420000,
      quantity: 1,
      condition: BookCondition.LIKE_NEW,
      description: 'Sách kinh tế mới 100%, mua nhầm. Phù hợp cho sinh viên UEH.',
      location: 'TP.HCM, Quận 1',
      shippingOption: ShippingOption.BOTH,
      status: ListingStatus.APPROVED,
      publishedAt: new Date(),
      images: {
        create: [{ url: 'https://picsum.photos/seed/econ/400/600', isPrimary: true }],
      },
    },
  });

  // PENDING LISTING (for demo moderation)
  const pendingListing = await prisma.listing.create({
    data: {
      bookId: book3.id,
      sellerId: sellerUser.id,
      courseId: cs102.id,
      price: 300000,
      quantity: 1,
      condition: BookCondition.GOOD,
      description: 'Sách thuật toán. Cần được duyệt trước khi hiển thị.',
      location: 'TP.HCM, Quận 10',
      shippingOption: ShippingOption.BOTH,
      status: ListingStatus.PENDING_REVIEW,
      images: {
        create: [{ url: 'https://picsum.photos/seed/algo2/400/600', isPrimary: true }],
      },
    },
  });

  // Create book images for SEO
  await prisma.bookImage.createMany({
    data: [
      { bookId: book1.id, url: 'https://picsum.photos/seed/algo1/400/600', isPrimary: true },
      { bookId: book2.id, url: 'https://picsum.photos/seed/cleancode/400/600', isPrimary: true },
      { bookId: book3.id, url: 'https://picsum.photos/seed/algo2/400/600', isPrimary: true },
      { bookId: book4.id, url: 'https://picsum.photos/seed/econ/400/600', isPrimary: true },
      { bookId: book5.id, url: 'https://picsum.photos/seed/physics/400/600', isPrimary: true },
    ],
  });

  console.log(`✅ Created ${4} listings (3 approved, 1 pending)`);

  // ============================================
  // COMPLETED ORDER (for history and reviews)
  // ============================================
  console.log('\n🛒 Creating completed order...');
  
  const completedOrder = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-00001',
      buyerId: buyerUser.id,
      totalAmount: 350000,
      shippingFee: 25000,
      discountAmount: 0,
      finalAmount: 375000,
      status: OrderStatus.COMPLETED,
      shippingAddress: '123 Đường Lê Lợi, Quận 1, TP.HCM',
      shippingPhone: '0900000004',
      shippingName: 'Trần Thị Mua Sách',
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      items: {
        create: {
          listingId: listing1.id,
          quantity: 1,
          unitPrice: 350000,
          subtotal: 350000,
        },
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: completedOrder.id,
      method: PaymentMethod.MOCK_ONLINE,
      amount: 375000,
      status: PaymentStatus.SUCCESS,
      transactionId: 'TXN-DEMO-001',
      paidAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.escrowTransaction.create({
    data: {
      orderId: completedOrder.id,
      sellerId: sellerUser.id,
      buyerId: buyerUser.id,
      amount: 350000,
      platformFee: 17500,
      status: EscrowStatus.RELEASED,
      fundedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      releasedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Update listing to SOLD
  await prisma.listing.update({
    where: { id: listing1.id },
    data: { quantity: 1 }, // Keep 1 remaining
  });

  console.log('✅ Created completed order with payment and escrow');

  // ============================================
  // REVIEW FOR COMPLETED ORDER
  // ============================================
  console.log('\n⭐ Creating review...');
  
  const review = await prisma.review.create({
    data: {
      orderId: completedOrder.id,
      reviewerId: buyerUser.id,
      targetUserId: sellerUser.id,
      rating: 5,
      comment: 'Người bán rất nhiệt tình, sách đúng như mô tả. Giao hàng nhanh trong ngày!',
      status: 'APPROVED',
      response: 'Cảm ơn bạn đã mua sách! Rất vui khi được hỗ trợ.',
    },
  });

  console.log('✅ Created 5-star review');

  // ============================================
  // PENDING ORDER (for demo order tracking)
  // ============================================
  console.log('\n📋 Creating pending order...');
  
  const pendingOrder = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-00002',
      buyerId: buyerUser.id,
      totalAmount: 280000,
      shippingFee: 20000,
      discountAmount: 0,
      finalAmount: 300000,
      status: OrderStatus.PENDING,
      shippingAddress: '456 Đường Nguyễn Trãi, Quận 5, TP.HCM',
      shippingPhone: '0900000004',
      shippingName: 'Trần Thị Mua Sách',
      items: {
        create: {
          listingId: listing2.id,
          quantity: 1,
          unitPrice: 280000,
          subtotal: 280000,
        },
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: pendingOrder.id,
      method: PaymentMethod.MOCK_ONLINE,
      amount: 300000,
      status: PaymentStatus.PENDING,
      transactionId: 'TXN-DEMO-002',
    },
  });

  await prisma.escrowTransaction.create({
    data: {
      orderId: pendingOrder.id,
      sellerId: sellerUser.id,
      buyerId: buyerUser.id,
      amount: 280000,
      platformFee: 14000,
      status: EscrowStatus.FUNDED,
      fundedAt: new Date(),
    },
  });

  console.log('✅ Created pending order for demo');

  // ============================================
  // COUPON
  // ============================================
  console.log('\n🎟️ Creating demo coupon...');
  
  await prisma.coupon.create({
    data: {
      code: 'DEMO10',
      description: 'Giảm 10% cho đơn hàng đầu tiên',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 100000,
      maxDiscountAmount: 50000,
      usageLimit: 100,
      validFrom: new Date(),
      validUntil: new Date('2026-12-31'),
      isActive: true,
      createdById: adminUser.id,
    },
  });

  console.log('✅ Created DEMO10 coupon');

  // ============================================
  // FAVORITES
  // ============================================
  console.log('\n❤️ Creating favorites...');
  
  await prisma.favorite.createMany({
    data: [
      { userId: buyerUser.id, listingId: listing3.id },
      { userId: buyerUser.id, bookId: book5.id },
    ],
  });

  console.log('✅ Created favorites');

  // ============================================
  // NOTIFICATIONS
  // ============================================
  console.log('\n🔔 Creating notifications...');
  
  await prisma.notification.createMany({
    data: [
      {
        userId: buyerUser.id,
        type: 'ORDER_COMPLETED',
        title: 'Đơn hàng đã hoàn thành',
        message: 'Cảm ơn bạn đã mua sách tại SachGiaRe.vn! Đơn hàng ORD-2026-00001 đã hoàn thành.',
        status: 'UNREAD',
      },
      {
        userId: sellerUser.id,
        type: 'ORDER_CONFIRMED',
        title: 'Đơn hàng mới',
        message: 'Bạn có đơn hàng mới ORD-2026-00002. Vui lòng xác nhận và chuẩn bị hàng.',
        status: 'UNREAD',
      },
      {
        userId: modUser.id,
        type: 'LISTING_APPROVED',
        title: 'Tin đăng chờ duyệt',
        message: 'Có 1 tin đăng mới chờ bạn duyệt.',
        status: 'UNREAD',
      },
    ],
  });

  console.log('✅ Created notifications');

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n' + '='.repeat(50));
  console.log('🎬 DEMO SEED COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(50));
  console.log('\n📧 DEMO ACCOUNTS:');
  console.log('   admin@demo.local      / ' + DEMO_PASSWORD + ' (Admin)');
  console.log('   moderator@demo.local / ' + DEMO_PASSWORD + ' (Moderator)');
  console.log('   seller@demo.local    / ' + DEMO_PASSWORD + ' (Seller)');
  console.log('   buyer@demo.local     / ' + DEMO_PASSWORD + ' (Buyer)');
  console.log('\n📊 DATA CREATED:');
  console.log('   • 3 Universities');
  console.log('   • 3 Majors');
  console.log('   • 4 Courses');
  console.log('   • 4 Categories');
  console.log('   • 5 Books');
  console.log('   • 4 Listings (3 approved, 1 pending)');
  console.log('   • 2 Orders (1 completed, 1 pending)');
  console.log('   • 1 Review');
  console.log('   • 1 Coupon');
  console.log('\n🎯 DEMO FLOW READY!');
  console.log('='.repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ Demo seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
