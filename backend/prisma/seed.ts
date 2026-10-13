import { PrismaClient, UserStatus, RoleType, ListingStatus, OrderStatus, PaymentMethod, PaymentStatus, EscrowStatus, NotificationType, NotificationStatus, ReportStatus, ReportType, BookCondition, ShippingOption } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean up existing data (for re-seeding)
  console.log('Cleaning up existing data...');
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
  await prisma.listing.deleteMany();
  await prisma.bookImage.deleteMany();
  await prisma.book.deleteMany();
  await prisma.category.deleteMany();
  await prisma.course.deleteMany();
  await prisma.major.deleteMany();
  await prisma.university.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  console.log('✅ Cleanup completed');

  // ============================================
  // ROLES
  // ============================================
  console.log('Creating roles...');

  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: RoleType.ADMIN },
      update: {},
      create: { name: RoleType.ADMIN, description: 'Administrator with full access' },
    }),
    prisma.role.upsert({
      where: { name: RoleType.MODERATOR },
      update: {},
      create: { name: RoleType.MODERATOR, description: 'Content moderator' },
    }),
    prisma.role.upsert({
      where: { name: RoleType.SELLER },
      update: {},
      create: { name: RoleType.SELLER, description: 'Can list books for sale' },
    }),
    prisma.role.upsert({
      where: { name: RoleType.BUYER },
      update: {},
      create: { name: RoleType.BUYER, description: 'Can purchase books' },
    }),
    prisma.role.upsert({
      where: { name: RoleType.USER },
      update: {},
      create: { name: RoleType.USER, description: 'Standard user' },
    }),
  ]);

  console.log(`✅ Created ${roles.length} roles`);

  // ============================================
  // UNIVERSITIES
  // ============================================
  console.log('Creating universities...');

  const universities = await Promise.all([
    prisma.university.create({
      data: {
        name: 'Đại học Bách Khoa TP.HCM',
        shortName: 'HCMUT',
        address: '268 Lý Thường Kiệt, Quận 10, TP.HCM',
        website: 'https://hcmut.edu.vn',
      },
    }),
    prisma.university.create({
      data: {
        name: 'Đại học Kinh tế TP.HCM',
        shortName: 'UEH',
        address: '59C Nguyễn Đình Chiểu, Quận 1, TP.HCM',
        website: 'https://ueh.edu.vn',
      },
    }),
    prisma.university.create({
      data: {
        name: 'Đại học Khoa học Tự nhiên TP.HCM',
        shortName: 'HCMUS',
        address: '227 Nguyễn Văn Cừ, Quận 5, TP.HCM',
        website: 'https://hcmus.edu.vn',
      },
    }),
    prisma.university.create({
      data: {
        name: 'Đại học Luật TP.HCM',
        shortName: 'ULAW',
        address: '2 Nguyễn Tất Thành, Quận 4, TP.HCM',
        website: 'https://ulaw.edu.vn',
      },
    }),
  ]);

  console.log(`✅ Created ${universities.length} universities`);

  // ============================================
  // MAJORS
  // ============================================
  console.log('Creating majors...');

  const majors = await Promise.all([
    // HCMUT majors
    prisma.major.create({
      data: { name: 'Kỹ thuật Máy tính', code: 'CTK', universityId: universities[0].id },
    }),
    prisma.major.create({
      data: { name: 'Kỹ thuật Điện', code: 'CTD', universityId: universities[0].id },
    }),
    prisma.major.create({
      data: { name: 'Kỹ thuật Cơ khí', code: 'CTM', universityId: universities[0].id },
    }),
    // UEH majors
    prisma.major.create({
      data: { name: 'Kinh tế', code: 'KT', universityId: universities[1].id },
    }),
    prisma.major.create({
      data: { name: 'Tài chính - Ngân hàng', code: 'TCNH', universityId: universities[1].id },
    }),
    // HCMUS majors
    prisma.major.create({
      data: { name: 'Công nghệ Thông tin', code: 'CNTT', universityId: universities[2].id },
    }),
    prisma.major.create({
      data: { name: 'Khoa học Máy tính', code: 'KHMT', universityId: universities[2].id },
    }),
    // ULAW majors
    prisma.major.create({
      data: { name: 'Luật', code: 'L', universityId: universities[3].id },
    }),
  ]);

  console.log(`✅ Created ${majors.length} majors`);

  // ============================================
  // COURSES
  // ============================================
  console.log('Creating courses...');

  const courses = await Promise.all([
    // Computer Engineering courses
    prisma.course.create({
      data: { name: 'Nhập môn Lập trình', code: 'CS101', majorId: majors[0].id, semester: 1, year: 2024 },
    }),
    prisma.course.create({
      data: { name: 'Cấu trúc Dữ liệu', code: 'CS102', majorId: majors[0].id, semester: 2, year: 2024 },
    }),
    prisma.course.create({
      data: { name: 'Giải tích 1', code: 'MATH101', majorId: majors[0].id, semester: 1, year: 2024 },
    }),
    prisma.course.create({
      data: { name: 'Giải tích 2', code: 'MATH102', majorId: majors[0].id, semester: 2, year: 2024 },
    }),
    // IT courses
    prisma.course.create({
      data: { name: 'Lập trình Python', code: 'IT101', majorId: majors[5].id, semester: 1, year: 2024 },
    }),
    prisma.course.create({
      data: { name: 'Mạng Máy tính', code: 'IT201', majorId: majors[5].id, semester: 3, year: 2024 },
    }),
    // Economics courses
    prisma.course.create({
      data: { name: 'Kinh tế Vi mô', code: 'ECO101', majorId: majors[3].id, semester: 1, year: 2024 },
    }),
    prisma.course.create({
      data: { name: 'Kinh tế Vĩ mô', code: 'ECO102', majorId: majors[3].id, semester: 2, year: 2024 },
    }),
    // Law courses
    prisma.course.create({
      data: { name: 'Luật Hiến pháp', code: 'LAW101', majorId: majors[7].id, semester: 1, year: 2024 },
    }),
    prisma.course.create({
      data: { name: 'Luật Dân sự', code: 'LAW201', majorId: majors[7].id, semester: 2, year: 2024 },
    }),
  ]);

  console.log(`✅ Created ${courses.length} courses`);

  // ============================================
  // CATEGORIES
  // ============================================
  console.log('Creating categories...');

  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Khoa học Máy tính', description: 'Sách về CNTT và lập trình' } }),
    prisma.category.create({ data: { name: 'Kinh tế', description: 'Sách kinh tế, tài chính' } }),
    prisma.category.create({ data: { name: 'Luật', description: 'Sách luật và pháp lý' } }),
    prisma.category.create({ data: { name: 'Kỹ thuật', description: 'Sách kỹ thuật công trình' } }),
    prisma.category.create({ data: { name: 'Khoa học Tự nhiên', description: 'Sách toán, lý, hóa' } }),
    prisma.category.create({ data: { name: 'Ngoại ngữ', description: 'Sách học ngoại ngữ' } }),
    prisma.category.create({ data: { name: 'Sách tham khảo', description: 'Các loại sách tham khảo khác' } }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // ============================================
  // USERS
  // ============================================
  console.log('Creating users...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash,
      fullName: 'Admin User',
      phone: '0900000001',
      status: UserStatus.ACTIVE,
      universityId: universities[0].id,
    },
  });

  const moderatorUser = await prisma.user.create({
    data: {
      email: 'moderator@example.com',
      passwordHash,
      fullName: 'Moderator User',
      phone: '0900000002',
      status: UserStatus.ACTIVE,
      universityId: universities[0].id,
    },
  });

  const sellerUser = await prisma.user.create({
    data: {
      email: 'seller@example.com',
      passwordHash,
      fullName: 'Nguyễn Văn Minh',
      phone: '0900000003',
      status: UserStatus.ACTIVE,
      universityId: universities[0].id,
    },
  });

  const buyerUser = await prisma.user.create({
    data: {
      email: 'buyer@example.com',
      passwordHash,
      fullName: 'Trần Thị Lan',
      phone: '0900000004',
      status: UserStatus.ACTIVE,
      universityId: universities[1].id,
    },
  });

  const sellerUser2 = await prisma.user.create({
    data: {
      email: 'seller2@example.com',
      passwordHash,
      fullName: 'Lê Hoàng Nam',
      phone: '0900000005',
      status: UserStatus.ACTIVE,
      universityId: universities[2].id,
    },
  });

  console.log(`✅ Created 5 users`);

  // Assign roles
  await prisma.userRole.createMany({
    data: [
      { userId: adminUser.id, roleId: roles[0].id },
      { userId: adminUser.id, roleId: roles[2].id },
      { userId: adminUser.id, roleId: roles[3].id },
      { userId: moderatorUser.id, roleId: roles[1].id },
      { userId: sellerUser.id, roleId: roles[2].id },
      { userId: sellerUser.id, roleId: roles[3].id },
      { userId: buyerUser.id, roleId: roles[3].id },
      { userId: sellerUser2.id, roleId: roles[2].id },
      { userId: sellerUser2.id, roleId: roles[3].id },
    ],
  });

  console.log(`✅ Assigned roles to users`);

  // Create wallets
  await prisma.wallet.createMany({
    data: [
      { userId: adminUser.id, balance: 1000000, currency: 'VND' },
      { userId: moderatorUser.id, balance: 0, currency: 'VND' },
      { userId: sellerUser.id, balance: 500000, currency: 'VND' },
      { userId: buyerUser.id, balance: 2000000, currency: 'VND' },
      { userId: sellerUser2.id, balance: 300000, currency: 'VND' },
    ],
  });

  console.log(`✅ Created wallets`);

  // ============================================
  // BOOKS
  // ============================================
  console.log('Creating books...');

  const books = await Promise.all([
    prisma.book.create({
      data: {
        isbn: '978-0134685991',
        title: 'Introduction to Algorithms',
        author: 'Thomas H. Cormen',
        publisher: 'MIT Press',
        edition: '3rd Edition',
        publicationYear: 2009,
        description: 'Sách giáo trình kinh điển về thuật toán',
        condition: BookCondition.LIKE_NEW,
        categoryId: categories[0].id,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '978-0596517748',
        title: 'JavaScript: The Good Parts',
        author: 'Douglas Crockford',
        publisher: "O'Reilly Media",
        edition: '1st Edition',
        publicationYear: 2008,
        description: 'Cuốn sách về JavaScript',
        condition: BookCondition.GOOD,
        categoryId: categories[0].id,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '978-0321125217',
        title: 'Domain-Driven Design',
        author: 'Eric Evans',
        publisher: 'Addison-Wesley',
        edition: '1st Edition',
        publicationYear: 2003,
        description: 'Thiết kế hướng miền trong phát triển phần mềm',
        condition: BookCondition.GOOD,
        categoryId: categories[0].id,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '978-0131103627',
        title: 'The C Programming Language',
        author: 'Brian Kernighan, Dennis Ritchie',
        publisher: 'Prentice Hall',
        edition: '2nd Edition',
        publicationYear: 1988,
        description: 'Sách kinh điển về ngôn ngữ C',
        condition: BookCondition.FAIR,
        categoryId: categories[0].id,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '978-0201633610',
        title: 'Design Patterns',
        author: 'Gang of Four',
        publisher: 'Addison-Wesley',
        edition: '1st Edition',
        publicationYear: 1994,
        description: '23 mẫu thiết kế trong lập trình hướng đối tượng',
        condition: BookCondition.LIKE_NEW,
        categoryId: categories[0].id,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '978-1491950357',
        title: 'Building Microservices',
        author: 'Sam Newman',
        publisher: "O'Reilly Media",
        edition: '1st Edition',
        publicationYear: 2015,
        description: 'Xây dựng kiến trúc microservices',
        condition: BookCondition.GOOD,
        categoryId: categories[0].id,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '978-0321127426',
        title: 'Patterns of Enterprise Application Architecture',
        author: 'Martin Fowler',
        publisher: 'Addison-Wesley',
        edition: '1st Edition',
        publicationYear: 2002,
        description: 'Các mẫu kiến trúc ứng dụng doanh nghiệp',
        condition: BookCondition.GOOD,
        categoryId: categories[0].id,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '978-0321146533',
        title: 'Test Driven Development',
        author: 'Kent Beck',
        publisher: 'Addison-Wesley',
        edition: '1st Edition',
        publicationYear: 2002,
        description: 'Phát triển hướng kiểm thử',
        condition: BookCondition.LIKE_NEW,
        categoryId: categories[0].id,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '978-0321573513',
        title: 'Algorithms 4th Edition',
        author: 'Robert Sedgewick',
        publisher: 'Addison-Wesley',
        edition: '4th Edition',
        publicationYear: 2011,
        description: 'Thuật toán nâng cao',
        condition: BookCondition.GOOD,
        categoryId: categories[0].id,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '978-0132350884',
        title: 'Clean Code',
        author: 'Robert C. Martin',
        publisher: 'Prentice Hall',
        edition: '1st Edition',
        publicationYear: 2008,
        description: 'Viết code sạch',
        condition: BookCondition.LIKE_NEW,
        categoryId: categories[0].id,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '978-1454819367',
        title: 'Fundamentals of Logic Design',
        author: 'Charles H. Roth Jr.',
        publisher: 'Cengage',
        edition: '1st Edition',
        publicationYear: 2013,
        description: 'Cơ sở thiết kế logic',
        condition: BookCondition.GOOD,
        categoryId: categories[0].id,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '978-0134757599',
        title: 'Organic Chemistry',
        author: 'David R. Klein',
        publisher: 'Wiley',
        edition: '3rd Edition',
        publicationYear: 2017,
        description: 'Giáo trình hóa hữu cơ',
        condition: BookCondition.GOOD,
        categoryId: categories[4].id,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '978-0321909108',
        title: 'University Physics',
        author: 'Young & Freedman',
        publisher: 'Pearson',
        edition: '14th Edition',
        publicationYear: 2015,
        description: 'Vật lý đại cương',
        condition: BookCondition.FAIR,
        categoryId: categories[4].id,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '978-1305270107',
        title: 'Principles of Economics',
        author: 'N. Gregory Mankiw',
        publisher: 'Cengage',
        edition: '8th Edition',
        publicationYear: 2017,
        description: 'Nguyên lý kinh tế',
        condition: BookCondition.LIKE_NEW,
        categoryId: categories[1].id,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '978-1337090353',
        title: 'Microeconomics',
        author: 'Robert Pindyck',
        publisher: 'Pearson',
        edition: '9th Edition',
        publicationYear: 2017,
        description: 'Kinh tế vi mô',
        condition: BookCondition.GOOD,
        categoryId: categories[1].id,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '978-1305621949',
        title: 'Macroeconomics',
        author: 'N. Gregory Mankiw',
        publisher: 'Cengage',
        edition: '9th Edition',
        publicationYear: 2017,
        description: 'Kinh tế vĩ mô',
        condition: BookCondition.GOOD,
        categoryId: categories[1].id,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '978-0415828758',
        title: 'Constitutional Law',
        author: 'John E. Finn',
        publisher: 'Routledge',
        edition: '1st Edition',
        publicationYear: 2014,
        description: 'Luật hiến pháp',
        condition: BookCondition.GOOD,
        categoryId: categories[2].id,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '978-1454826358',
        title: 'Civil Law',
        author: 'John V. Orth',
        publisher: 'Wolters Kluwer',
        edition: '1st Edition',
        publicationYear: 2013,
        description: 'Luật dân sự',
        condition: BookCondition.LIKE_NEW,
        categoryId: categories[2].id,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '978-0073397943',
        title: 'Engineering Mechanics: Statics',
        author: 'R.C. Hibbeler',
        publisher: 'Pearson',
        edition: '14th Edition',
        publicationYear: 2015,
        description: 'Cơ học kỹ thuật - Tĩnh học',
        condition: BookCondition.GOOD,
        categoryId: categories[3].id,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '978-0134382593',
        title: 'Materials Science and Engineering',
        author: 'William D. Callister',
        publisher: 'Wiley',
        edition: '9th Edition',
        publicationYear: 2014,
        description: 'Khoa học và kỹ thuật vật liệu',
        condition: BookCondition.FAIR,
        categoryId: categories[3].id,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '978-0134670942',
        title: 'Engineering Mechanics: Dynamics',
        author: 'R.C. Hibbeler',
        publisher: 'Pearson',
        edition: '14th Edition',
        publicationYear: 2015,
        description: 'Cơ học kỹ thuật - Động lực học',
        condition: BookCondition.GOOD,
        categoryId: categories[3].id,
      },
    }),
    prisma.book.create({
      data: {
        isbn: '978-1617294433',
        title: 'Microservices Patterns',
        author: 'Chris Richardson',
        publisher: 'Manning',
        edition: '1st Edition',
        publicationYear: 2018,
        description: 'Các mẫu thiết kế cho microservices',
        condition: BookCondition.LIKE_NEW,
        categoryId: categories[0].id,
      },
    }),
  ]);

  console.log(`✅ Created ${books.length} books`);

  // Create book images
  await prisma.bookImage.createMany({
    data: books.slice(0, 10).map((book, index) => ({
      bookId: book.id,
      url: `https://picsum.photos/seed/${book.id}/400/600`,
      isPrimary: true,
      order: 0,
    })),
  });

  console.log(`✅ Created book images`);

  // ============================================
  // LISTINGS
  // ============================================
  console.log('Creating listings...');

  const listings = await Promise.all([
    // Seller 1 listings
    prisma.listing.create({
      data: {
        bookId: books[0].id,
        sellerId: sellerUser.id,
        courseId: courses[0].id,
        price: 250000,
        quantity: 1,
        condition: BookCondition.LIKE_NEW,
        description: 'Sách mới chưa sử dụng, có ghi chú của sinh viên',
        location: 'TP.HCM, Quận 10',
        shippingOption: ShippingOption.BOTH,
        status: ListingStatus.APPROVED,
        publishedAt: new Date(),
      },
    }),
    prisma.listing.create({
      data: {
        bookId: books[1].id,
        sellerId: sellerUser.id,
        price: 120000,
        quantity: 1,
        condition: BookCondition.GOOD,
        description: 'Sách đã sử dụng một học kỳ, bìa còn tốt',
        location: 'TP.HCM, Quận 10',
        shippingOption: ShippingOption.PICKUP,
        status: ListingStatus.APPROVED,
        publishedAt: new Date(),
      },
    }),
    prisma.listing.create({
      data: {
        bookId: books[2].id,
        sellerId: sellerUser.id,
        price: 350000,
        quantity: 1,
        condition: BookCondition.GOOD,
        description: 'Sách về thiết kế hệ thống, cần bán gấp',
        location: 'TP.HCM, Quận 10',
        shippingOption: ShippingOption.DELIVERY,
        status: ListingStatus.APPROVED,
        publishedAt: new Date(),
      },
    }),
    prisma.listing.create({
      data: {
        bookId: books[3].id,
        sellerId: sellerUser.id,
        price: 80000,
        quantity: 1,
        condition: BookCondition.FAIR,
        description: 'Sách cũ nhưng nội dung còn rõ ràng',
        location: 'TP.HCM, Quận 10',
        shippingOption: ShippingOption.PICKUP,
        status: ListingStatus.PENDING_REVIEW,
      },
    }),
    // Seller 2 listings
    prisma.listing.create({
      data: {
        bookId: books[4].id,
        sellerId: sellerUser2.id,
        price: 180000,
        quantity: 1,
        condition: BookCondition.LIKE_NEW,
        description: 'Chưa mở seal, mua nhầm',
        location: 'TP.HCM, Quận 5',
        status: ListingStatus.APPROVED,
        publishedAt: new Date(),
      },
    }),
    prisma.listing.create({
      data: {
        bookId: books[5].id,
        sellerId: sellerUser2.id,
        price: 220000,
        quantity: 1,
        condition: BookCondition.GOOD,
        description: 'Sách về microservices, phù hợp cho ai học cloud',
        location: 'TP.HCM, Quận 5',
        status: ListingStatus.APPROVED,
        publishedAt: new Date(),
      },
    }),
    prisma.listing.create({
      data: {
        bookId: books[6].id,
        sellerId: sellerUser2.id,
        price: 280000,
        quantity: 1,
        condition: BookCondition.GOOD,
        description: 'Sách về patterns trong kiến trúc phần mềm',
        location: 'TP.HCM, Quận 5',
        status: ListingStatus.APPROVED,
        publishedAt: new Date(),
      },
    }),
    prisma.listing.create({
      data: {
        bookId: books[7].id,
        sellerId: sellerUser2.id,
        price: 150000,
        quantity: 1,
        condition: BookCondition.LIKE_NEW,
        description: 'Mới mua nhưng không cần nữa',
        location: 'TP.HCM, Quận 5',
        status: ListingStatus.APPROVED,
        publishedAt: new Date(),
      },
    }),
    // More listings from seller 1
    prisma.listing.create({
      data: {
        bookId: books[10].id,
        sellerId: sellerUser.id,
        courseId: courses[6].id,
        price: 320000,
        quantity: 1,
        condition: BookCondition.LIKE_NEW,
        description: 'Principles of Economics - Sách kinh tế',
        location: 'TP.HCM, Quận 10',
        shippingOption: ShippingOption.BOTH,
        status: ListingStatus.APPROVED,
        publishedAt: new Date(),
      },
    }),
    prisma.listing.create({
      data: {
        bookId: books[11].id,
        sellerId: sellerUser.id,
        courseId: courses[6].id,
        price: 280000,
        quantity: 1,
        condition: BookCondition.GOOD,
        description: 'Microeconomics - Sách kinh tế vi mô',
        location: 'TP.HCM, Quận 10',
        shippingOption: ShippingOption.BOTH,
        status: ListingStatus.APPROVED,
        publishedAt: new Date(),
      },
    }),
    prisma.listing.create({
      data: {
        bookId: books[12].id,
        sellerId: sellerUser.id,
        courseId: courses[7].id,
        price: 300000,
        quantity: 1,
        condition: BookCondition.GOOD,
        description: 'Macroeconomics - Sách kinh tế vĩ mô',
        location: 'TP.HCM, Quận 10',
        shippingOption: ShippingOption.DELIVERY,
        status: ListingStatus.APPROVED,
        publishedAt: new Date(),
      },
    }),
    prisma.listing.create({
      data: {
        bookId: books[15].id,
        sellerId: sellerUser.id,
        courseId: courses[2].id,
        price: 380000,
        quantity: 1,
        condition: BookCondition.GOOD,
        description: 'Engineering Mechanics: Statics - Cơ học kỹ thuật',
        location: 'TP.HCM, Quận 10',
        shippingOption: ShippingOption.BOTH,
        status: ListingStatus.APPROVED,
        publishedAt: new Date(),
      },
    }),
    // Listings from seller 2
    prisma.listing.create({
      data: {
        bookId: books[13].id,
        sellerId: sellerUser2.id,
        courseId: courses[8].id,
        price: 260000,
        quantity: 1,
        condition: BookCondition.GOOD,
        description: 'Constitutional Law - Luật hiến pháp',
        location: 'TP.HCM, Quận 5',
        shippingOption: ShippingOption.PICKUP,
        status: ListingStatus.APPROVED,
        publishedAt: new Date(),
      },
    }),
    prisma.listing.create({
      data: {
        bookId: books[14].id,
        sellerId: sellerUser2.id,
        courseId: courses[9].id,
        price: 290000,
        quantity: 1,
        condition: BookCondition.LIKE_NEW,
        description: 'Civil Law - Luật dân sự',
        location: 'TP.HCM, Quận 5',
        shippingOption: ShippingOption.BOTH,
        status: ListingStatus.APPROVED,
        publishedAt: new Date(),
      },
    }),
    prisma.listing.create({
      data: {
        bookId: books[16].id,
        sellerId: sellerUser2.id,
        courseId: courses[2].id,
        price: 420000,
        quantity: 1,
        condition: BookCondition.FAIR,
        description: 'Materials Science and Engineering',
        location: 'TP.HCM, Quận 5',
        shippingOption: ShippingOption.PICKUP,
        status: ListingStatus.APPROVED,
        publishedAt: new Date(),
      },
    }),
    prisma.listing.create({
      data: {
        bookId: books[17].id,
        sellerId: sellerUser2.id,
        courseId: courses[2].id,
        price: 360000,
        quantity: 1,
        condition: BookCondition.GOOD,
        description: 'Engineering Mechanics: Dynamics',
        location: 'TP.HCM, Quận 5',
        shippingOption: ShippingOption.BOTH,
        status: ListingStatus.APPROVED,
        publishedAt: new Date(),
      },
    }),
    // Draft and rejected listings
    prisma.listing.create({
      data: {
        bookId: books[8].id,
        sellerId: sellerUser.id,
        price: 200000,
        quantity: 1,
        condition: BookCondition.GOOD,
        description: 'Draft listing',
        location: 'TP.HCM, Quận 10',
        shippingOption: ShippingOption.PICKUP,
        status: ListingStatus.DRAFT,
      },
    }),
    prisma.listing.create({
      data: {
        bookId: books[9].id,
        sellerId: sellerUser.id,
        price: 180000,
        quantity: 1,
        condition: BookCondition.FAIR,
        description: 'Rejected listing',
        location: 'TP.HCM, Quận 10',
        shippingOption: ShippingOption.PICKUP,
        status: ListingStatus.REJECTED,
        rejectionReason: 'Price is too low compared to market value',
      },
    }),
    // Sold listing
    prisma.listing.create({
      data: {
        bookId: books[18].id,
        sellerId: sellerUser2.id,
        price: 150000,
        quantity: 1,
        condition: BookCondition.POOR,
        description: 'Introduction to Algorithms 2nd Edition - Đã bán',
        location: 'TP.HCM, Quận 5',
        shippingOption: ShippingOption.BOTH,
        status: ListingStatus.SOLD,
      },
    }),
    prisma.listing.create({
      data: {
        bookId: books[19].id,
        sellerId: sellerUser.id,
        price: 200000,
        quantity: 1,
        condition: BookCondition.LIKE_NEW,
        description: 'Clean Code - Sách về viết code sạch',
        location: 'TP.HCM, Quận 10',
        shippingOption: ShippingOption.BOTH,
        status: ListingStatus.APPROVED,
        publishedAt: new Date(),
      },
    }),
  ]);

  console.log(`✅ Created ${listings.length} listings`);

  // ============================================
  // COUPONS
  // ============================================
  console.log('Creating coupons...');

  const coupon1 = await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
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

  const coupon2 = await prisma.coupon.create({
    data: {
      code: 'SUMMER50K',
      description: 'Giảm 50.000đ cho mọi đơn hàng',
      discountType: 'FIXED_AMOUNT',
      discountValue: 50000,
      minOrderAmount: 200000,
      usageLimit: 50,
      validFrom: new Date(),
      validUntil: new Date('2026-10-31'),
      isActive: true,
      createdById: adminUser.id,
    },
  });

  console.log(`✅ Created 2 coupons`);

  // ============================================
  // ORDERS
  // ============================================
  console.log('Creating orders...');

  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2024-00001',
      buyerId: buyerUser.id,
      totalAmount: 470000,
      shippingFee: 30000,
      discountAmount: 0,
      finalAmount: 500000,
      status: OrderStatus.COMPLETED,
      shippingAddress: '123 Nguyễn Trãi, Quận 1, TP.HCM',
      shippingPhone: '0909123456',
      shippingName: 'Trần Thị Lan',
      completedAt: new Date(),
      couponId: null,
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2024-00002',
      buyerId: buyerUser.id,
      totalAmount: 180000,
      shippingFee: 25000,
      discountAmount: 50000,
      finalAmount: 155000,
      status: OrderStatus.COMPLETED,
      shippingAddress: '456 Lê Lợi, Quận 1, TP.HCM',
      shippingPhone: '0909123456',
      shippingName: 'Trần Thị Lan',
      completedAt: new Date(),
      couponId: coupon2.id,
    },
  });

  const order3 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2024-00003',
      buyerId: buyerUser.id,
      totalAmount: 620000,
      shippingFee: 35000,
      discountAmount: 62000,
      finalAmount: 593000,
      status: OrderStatus.PENDING,
      shippingAddress: '789 Đồng Khởi, Quận 1, TP.HCM',
      shippingPhone: '0909123456',
      shippingName: 'Trần Thị Lan',
    },
  });

  console.log(`✅ Created 3 orders`);

  // Order Items
  await prisma.orderItem.createMany({
    data: [
      { orderId: order1.id, listingId: listings[0].id, quantity: 1, unitPrice: 250000, subtotal: 250000 },
      { orderId: order1.id, listingId: listings[1].id, quantity: 1, unitPrice: 120000, subtotal: 120000 },
      { orderId: order1.id, listingId: listings[2].id, quantity: 1, unitPrice: 100000, subtotal: 100000 },
      { orderId: order2.id, listingId: listings[4].id, quantity: 1, unitPrice: 180000, subtotal: 180000 },
      { orderId: order3.id, listingId: listings[5].id, quantity: 1, unitPrice: 220000, subtotal: 220000 },
      { orderId: order3.id, listingId: listings[6].id, quantity: 1, unitPrice: 280000, subtotal: 280000 },
      { orderId: order3.id, listingId: listings[7].id, quantity: 1, unitPrice: 120000, subtotal: 120000 },
    ],
  });

  console.log(`✅ Created order items`);

  // Update listings to SOLD
  await prisma.listing.update({
    where: { id: listings[0].id },
    data: { status: ListingStatus.SOLD },
  });
  await prisma.listing.update({
    where: { id: listings[1].id },
    data: { status: ListingStatus.SOLD },
  });
  await prisma.listing.update({
    where: { id: listings[2].id },
    data: { status: ListingStatus.SOLD },
  });
  await prisma.listing.update({
    where: { id: listings[4].id },
    data: { status: ListingStatus.SOLD },
  });

  // ============================================
  // PAYMENTS
  // ============================================
  console.log('Creating payments...');

  await prisma.payment.createMany({
    data: [
      {
        orderId: order1.id,
        method: PaymentMethod.MOCK_ONLINE,
        amount: 500000,
        status: PaymentStatus.SUCCESS,
        transactionId: 'TXN-001',
        paidAt: new Date(),
        completedAt: new Date(),
      },
      {
        orderId: order2.id,
        method: PaymentMethod.COD,
        amount: 155000,
        status: PaymentStatus.SUCCESS,
        transactionId: 'TXN-002',
        paidAt: new Date(),
        completedAt: new Date(),
      },
      {
        orderId: order3.id,
        method: PaymentMethod.MOCK_ONLINE,
        amount: 593000,
        status: PaymentStatus.PENDING,
        transactionId: 'TXN-003',
      },
    ],
  });

  console.log(`✅ Created payments`);

  // ============================================
  // ESCROW TRANSACTIONS
  // ============================================
  console.log('Creating escrow transactions...');

  await prisma.escrowTransaction.createMany({
    data: [
      {
        orderId: order1.id,
        sellerId: sellerUser.id,
        buyerId: buyerUser.id,
        amount: 470000,
        platformFee: 23500,
        status: EscrowStatus.RELEASED,
        fundedAt: new Date(),
        releasedAt: new Date(),
      },
      {
        orderId: order2.id,
        sellerId: sellerUser2.id,
        buyerId: buyerUser.id,
        amount: 180000,
        platformFee: 9000,
        status: EscrowStatus.RELEASED,
        fundedAt: new Date(),
        releasedAt: new Date(),
      },
      {
        orderId: order3.id,
        sellerId: sellerUser2.id,
        buyerId: buyerUser.id,
        amount: 620000,
        platformFee: 31000,
        status: EscrowStatus.FUNDED,
        fundedAt: new Date(),
      },
    ],
  });

  console.log(`✅ Created escrow transactions`);

  // ============================================
  // REVIEWS
  // ============================================
  console.log('Creating reviews...');

  await prisma.review.createMany({
    data: [
      {
        orderId: order1.id,
        reviewerId: buyerUser.id,
        targetUserId: sellerUser.id,
        rating: 5,
        comment: 'Người bán rất nhiệt tình, sách đúng như mô tả. Giao hàng nhanh!',
        createdAt: new Date(),
      },
      {
        orderId: order2.id,
        reviewerId: buyerUser.id,
        targetUserId: sellerUser2.id,
        rating: 4,
        comment: 'Sách tốt, giao hàng đúng hẹn. Có điều packaging hơi đơn giản.',
        createdAt: new Date(),
      },
    ],
  });

  console.log(`✅ Created reviews`);

  // ============================================
  // FAVORITES
  // ============================================
  console.log('Creating favorites...');

  await prisma.favorite.createMany({
    data: [
      { userId: buyerUser.id, bookId: books[4].id },
      { userId: buyerUser.id, bookId: books[5].id },
      { userId: buyerUser.id, listingId: listings[5].id },
      { userId: sellerUser.id, bookId: books[10].id },
    ],
  });

  console.log(`✅ Created favorites`);

  // ============================================
  // NOTIFICATIONS
  // ============================================
  console.log('Creating notifications...');

  await prisma.notification.createMany({
    data: [
      {
        userId: buyerUser.id,
        type: NotificationType.ORDER_COMPLETED,
        title: 'Đơn hàng đã hoàn thành',
        message: 'Cảm ơn bạn đã mua sắm tại Textbook Marketplace!',
        status: NotificationStatus.UNREAD,
      },
      {
        userId: sellerUser.id,
        type: NotificationType.PAYMENT_RECEIVED,
        title: 'Bạn đã nhận được thanh toán',
        message: 'Đơn hàng ORD-2024-00001 đã được thanh toán. Số tiền: 470.000đ',
        status: NotificationStatus.UNREAD,
      },
      {
        userId: buyerUser.id,
        type: NotificationType.ORDER_CONFIRMED,
        title: 'Đơn hàng đang chờ xác nhận',
        message: 'Đơn hàng ORD-2024-00003 đang chờ người bán xác nhận.',
        status: NotificationStatus.UNREAD,
      },
    ],
  });

  console.log(`✅ Created notifications`);

  // ============================================
  // REPORTS
  // ============================================
  console.log('Creating reports...');

  await prisma.report.create({
    data: {
      reporterId: buyerUser.id,
      listingId: listings[3].id,
      type: ReportType.PRICE_GOUGEING,
      description: 'Giá sách này quá cao so với giá thị trường',
      status: ReportStatus.PENDING,
    },
  });

  console.log(`✅ Created reports`);

  // ============================================
  // AUDIT LOGS
  // ============================================
  console.log('Creating audit logs...');

  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        action: 'USER_LOGIN',
        entityType: 'User',
        entityId: adminUser.id.toString(),
        newData: { ip: '127.0.0.1' },
      },
      {
        userId: sellerUser.id,
        action: 'LISTING_CREATED',
        entityType: 'Listing',
        entityId: listings[0].id.toString(),
        newData: { title: books[0].title, price: 250000 },
      },
      {
        userId: moderatorUser.id,
        action: 'LISTING_APPROVED',
        entityType: 'Listing',
        entityId: listings[0].id.toString(),
        oldData: { status: 'PENDING_REVIEW' },
        newData: { status: 'APPROVED' },
      },
    ],
  });

  console.log(`✅ Created audit logs`);

  console.log('');
  console.log('🎉 Database seed completed successfully!');
  console.log('');
  console.log('📧 Test accounts:');
  console.log('   admin@example.com / password123');
  console.log('   moderator@example.com / password123');
  console.log('   seller@example.com / password123');
  console.log('   buyer@example.com / password123');
  console.log('   seller2@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
