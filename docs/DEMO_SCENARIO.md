# Demo Scenario - SachGiaRe.vn

**Video Duration:** 5-10 minutes  
**Project:** Textbook Marketplace C2C Platform  
**Demo Mode:** Full flow from guest browsing to order completion

---

## Demo Setup

### 1. Reset Database

```bash
cd backend
npm run db:demo
```

### 2. Start Services

```bash
cd ..
docker compose up -d
# Wait for services to be ready (~2 minutes)
docker compose logs -f backend
```

### 3. Demo Accounts

| Role | Email | Password | Balance |
|------|-------|----------|---------|
| **Admin** | admin@demo.local | Demo123! | 10,000,000 VND |
| **Moderator** | moderator@demo.local | Demo123! | 500,000 VND |
| **Seller** | seller@demo.local | Demo123! | 2,500,000 VND |
| **Buyer** | buyer@demo.local | Demo123! | 5,000,000 VND |

### 4. URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Swagger Docs | http://localhost:3000/api/docs |

---

## Demo Script (5-10 Minutes)

### Scene 1: Guest Browse Homepage (30 seconds)

**Goal:** Show the platform's main interface

**Steps:**
1. Open browser to `http://localhost:5173`
2. Show the hero section with search bar
3. Hover over categories section (8 categories)
4. Show universities section
5. Show featured listings grid
6. Click on a listing card → show listing detail

**Narration:**
> "Xin chào! Đây là SachGiaRe.vn - nền tảng mua bán sách giáo trình cho sinh viên. Giao diện chính hiển thị các danh mục sách, trường đại học và các tin đăng nổi bật."

---

### Scene 2: Search & Filter (30 seconds)

**Goal:** Demonstrate search functionality

**Steps:**
1. Click search bar
2. Type "algorithms"
3. Show search results
4. Apply filters:
   - Category: Computer Science
   - Price range: 200,000 - 500,000 VND
   - Condition: Like New
5. Show filtered results
6. Sort by price (low to high)

**Narration:**
> "Người dùng có thể tìm kiếm sách theo tên, lọc theo danh mục, giá, tình trạng và sắp xếp kết quả."

---

### Scene 3: Register & Login (1 minute)

**Goal:** Show authentication flow

**Steps (Register):**
1. Click "Đăng ký" button
2. Fill registration form:
   - Email: newuser@demo.local
   - Password: NewUser123!
   - Full Name: Demo User
   - Phone: 0900000005
3. Click register
4. Show success message
5. Show redirect to login

**Steps (Login):**
1. Login as **buyer@demo.local** / **Demo123!**
2. Show successful login
3. Show header updated with user name

**Narration:**
> "Đăng ký tài khoản mới hoặc đăng nhập với tài khoản có sẵn. Hệ thống hỗ trợ JWT authentication."

---

### Scene 4: Seller Creates Listing (1 minute)

**Goal:** Show seller listing creation

**Steps:**
1. Logout and login as **seller@demo.local** / **Demo123!**
2. Click "Đăng bán" button
3. Fill listing form:
   - Book Title: "Design Patterns"
   - ISBN: 978-0201633610
   - Author: Gang of Four
   - Category: Computer Science
   - Course: CS102 - Cấu trúc Dữ liệu
   - Price: 320,000 VND
   - Condition: Good
   - Description: Sách về design patterns, đã sử dụng 1 học kỳ
   - Location: TP.HCM, Quận 10
   - Shipping: Both pickup and delivery
4. Upload image (optional)
5. Click submit
6. Show listing created with "PENDING_REVIEW" status

**Narration:**
> "Seller đăng tin bán sách mới. Tin đăng sẽ được chuyển sang trạng thái 'Chờ duyệt' trước khi hiển thị công khai."

---

### Scene 5: Moderator Approves Listing (30 seconds)

**Goal:** Show moderation workflow

**Steps:**
1. Logout and login as **moderator@demo.local** / **Demo123!**
2. Navigate to `/admin/moderation`
3. Show pending listings list
4. Click on the new listing
5. Review details
6. Click "Duyệt" (Approve) button
7. Show success message
8. Show listing now in "APPROVED" status

**Narration:**
> "Moderator duyệt tin đăng mới. Đây là bước kiểm soát chất lượng nội dung trên nền tảng."

---

### Scene 6: Buyer Adds to Cart (30 seconds)

**Goal:** Show cart functionality

**Steps:**
1. Logout and login as **buyer@demo.local** / **Demo123!**
2. Navigate to homepage
3. Find the approved listing from Scene 4
4. Click on listing detail
5. Click "Thêm vào giỏ" button
6. Show cart badge updated
7. Click cart icon to view cart
8. Show cart with items

**Narration:**
> "Buyer thêm sách vào giỏ hàng. Có thể thêm nhiều sản phẩm và điều chỉnh số lượng."

---

### Scene 7: Checkout Process (1 minute)

**Goal:** Show complete checkout flow

**Steps:**
1. In cart, click "Tiến hành thanh toán"
2. **Step 1:** Review order items
3. **Step 2:** Enter shipping info:
   - Name: Trần Thị Mua Sách
   - Phone: 0900000004
   - Address: 789 Đường Lê Lợi, Quận 1, TP.HCM
4. **Step 3:** Select shipping method
5. **Step 4:** Review total (subtotal + shipping fee)
6. Apply coupon: DEMO10
7. Show discount applied
8. Accept terms and conditions
9. Click "Đặt hàng"

**Narration:**
> "Checkout gồm 4 bước: xem sản phẩm, nhập địa chỉ, chọn phương thức vận chuyển và xác nhận. Có thể áp dụng mã giảm giá."

---

### Scene 8: Mock Payment (30 seconds)

**Goal:** Show payment flow

**Steps:**
1. After checkout, redirect to payment page
2. Show order summary
3. Select payment method:
   - COD (Cash on Delivery)
   - Mock Online Payment
4. Select "Mock Online Payment"
5. Click "Thanh toán"
6. Show loading state
7. Show payment success page

**Narration:**
> "Hệ thống hỗ trợ thanh toán COD và thanh toán online mô phỏng. Đây là demo nên không có giao dịch thật."

---

### Scene 9: Escrow Created (15 seconds)

**Goal:** Explain escrow mechanism

**Steps:**
1. In order detail, show escrow status
2. Explain:
   - Amount held: Order total - shipping fee
   - Platform fee: 5%
   - Status: "Đang giữ" (Held)

**Narration:**
> "Sau khi thanh toán thành công, số tiền sẽ được giữ trong escrow. Seller sẽ nhận tiền sau khi giao hàng thành công."

---

### Scene 10: Seller Updates Shipping (30 seconds)

**Goal:** Show seller order management

**Steps:**
1. Logout and login as **seller@demo.local** / **Demo123!**
2. Go to "Đơn hàng của tôi" (My Orders)
3. Find the new order
4. Click to view order details
5. Click "Cập nhật vận chuyển"
6. Enter tracking info or mark as "Đã giao"
7. Save

**Narration:**
> "Seller cập nhật trạng thái vận chuyển. Có thể cung cấp mã tracking hoặc đánh dấu đã giao."

---

### Scene 11: Buyer Confirms Delivery (15 seconds)

**Goal:** Show escrow release

**Steps:**
1. Logout and login as **buyer@demo.local** / **Demo123!**
2. Go to "Đơn hàng của tôi"
3. Find the order with status "Đã giao"
4. Click "Xác nhận đã nhận hàng"
5. Show escrow released
6. Show wallet balance updated

**Narration:**
> "Buyer xác nhận đã nhận hàng. Escrow được giải phóng và seller nhận được tiền."

---

### Scene 12: Buyer Reviews Seller (30 seconds)

**Goal:** Show review system

**Steps:**
1. After confirming delivery, prompt to review
2. Click "Đánh giá"
3. Select rating (5 stars)
4. Enter comment: "Sách đúng như mô tả, giao hàng nhanh!"
5. Click gửi đánh giá
6. Show review submitted

**Narration:**
> "Buyer đánh giá seller sau khi hoàn tất giao dịch. Đánh giá ảnh hưởng đến reputation score của seller."

---

### Scene 13: Admin Dashboard (1 minute)

**Goal:** Show admin capabilities

**Steps:**
1. Logout and login as **admin@demo.local** / **Demo123!**
2. Navigate to `/admin`
3. Show dashboard metrics:
   - Total Users
   - Total Listings
   - Total Orders
   - Revenue
4. Navigate to "Quản lý người dùng"
5. Show user list with actions
6. Navigate to "Quản lý đơn hàng"
7. Show orders with status filters
8. Navigate to "Báo cáo"
9. Show revenue report

**Narration:**
> "Admin dashboard hiển thị tổng quan về người dùng, đơn hàng và doanh thu. Có thể quản lý người dùng, tin đăng và xem báo cáo."

---

## Demo Flow Summary

| Scene | Feature | Duration |
|-------|---------|----------|
| 1 | Guest Browse | 30s |
| 2 | Search/Filter | 30s |
| 3 | Register/Login | 1 min |
| 4 | Seller Creates Listing | 1 min |
| 5 | Moderator Approves | 30s |
| 6 | Buyer Adds to Cart | 30s |
| 7 | Checkout | 1 min |
| 8 | Mock Payment | 30s |
| 9 | Escrow Created | 15s |
| 10 | Seller Updates Shipping | 30s |
| 11 | Buyer Confirms Delivery | 15s |
| 12 | Buyer Reviews | 30s |
| 13 | Admin Dashboard | 1 min |
| **TOTAL** | | **~7-8 min** |

---

## Tips for Demo

### Preparation
- [ ] Reset database with `npm run db:demo`
- [ ] Start all services
- [ ] Test login for all 4 accounts
- [ ] Verify pending listing exists
- [ ] Check order has correct escrow status

### During Demo
- [ ] Use incognito window to avoid cached login
- [ ] Keep browser console closed (no errors shown)
- [ ] Speak clearly and explain each step
- [ ] Pause after key actions for viewer comprehension

### Demo Data
- 3 Universities (HCMUT, UEH, HCMUS)
- 3 Majors
- 4 Courses
- 4 Categories
- 5 Books
- 4 Listings (3 approved, 1 pending)
- 2 Orders (1 completed, 1 pending)
- 1 Review
- 1 Coupon (DEMO10)

---

## Troubleshooting

### Issue: Can't login
**Fix:** Check backend is running: `docker compose logs backend`

### Issue: Database not reset
**Fix:** Run `npm run db:demo` in backend folder

### Issue: Services not starting
**Fix:** 
```bash
docker compose down
docker compose up -d
```

### Issue: Images not loading
**Fix:** Images use picsum.photos (external). Check internet connection.

---

*Document version: 1.0*  
*Last updated: 2026-09-25*
