# Bộ Kiểm Thử Hệ Thống - Textbook Marketplace

**Phiên bản:** 1.0  
**Ngày tạo:** 2026-09-25  
**Môi trường:** Sandbox (Development)

---

## Tổng quan

Tài liệu này chứa bộ kiểm thử toàn diện cho hệ thống Textbook Marketplace (SachGiaRe.vn).

---

## Quy ước

| Ký hiệu | Ý nghĩa |
|----------|----------|
| ✅ PASS | Test đã chạy và đạt |
| ❌ FAIL | Test đã chạy và thất bại |
| ⏸️ PENDING | Test chưa được chạy |
| ⚠️ N/A | Không áp dụng |

---

## AUTH - Xác thực người dùng (TC-01 → TC-08)

### TC-01: Đăng ký tài khoản thành công

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-01 |
| **Chức năng** | AUTH - Đăng ký tài khoản |
| **Tiền điều kiện** | Không có tài khoản với email test_auth_01@example.com |
| **Bước thực hiện** | 1. POST /api/auth/register<br>2. Body: `{ email: "test_auth_01@example.com", password: "TestPassword123!", fullName: "Test User", phone: "0901234567" }` |
| **Kết quả mong đợi** | Status 201, trả về accessToken và user info |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-02: Đăng ký với email đã tồn tại

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-02 |
| **Chức năng** | AUTH - Đăng ký tài khoản trùng lặp |
| **Tiền điều kiện** | Đã có tài khoản với email test_auth_01@example.com |
| **Bước thực hiện** | 1. POST /api/auth/register<br>2. Body: `{ email: "test_auth_01@example.com", password: "TestPassword123!", fullName: "Test User" }` |
| **Kết quả mong đợi** | Status 409 Conflict, message "Email already registered" |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-03: Đăng ký với mật khẩu yếu

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-03 |
| **Chức năng** | AUTH - Validation mật khẩu |
| **Tiền điều kiện** | Không có |
| **Bước thực hiện** | 1. POST /api/auth/register<br>2. Body: `{ email: "weak@example.com", password: "12345678", fullName: "Test" }` |
| **Kết quả mong đợi** | Status 400, validation error về password strength |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-04: Đăng nhập thành công

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-04 |
| **Chức năng** | AUTH - Đăng nhập |
| **Tiền điều kiện** | Có tài khoản test_auth_01@example.com / TestPassword123! |
| **Bước thực hiện** | 1. POST /api/auth/login<br>2. Body: `{ email: "test_auth_01@example.com", password: "TestPassword123!" }` |
| **Kết quả mong đợi** | Status 201, trả về accessToken |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-05: Đăng nhập với mật khẩu sai

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-05 |
| **Chức năng** | AUTH - Sai mật khẩu |
| **Tiền điều kiện** | Có tài khoản test_auth_01@example.com |
| **Bước thực hiện** | 1. POST /api/auth/login<br>2. Body: `{ email: "test_auth_01@example.com", password: "WrongPassword123!" }` |
| **Kết quả mong đợi** | Status 401, message "Invalid email or password" |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-06: Brute-force login attack

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-06 |
| **Chức năng** | AUTH - Chống brute force |
| **Tiền điều kiện** | Không có |
| **Bước thực hiện** | 1. POST /api/auth/login 6 lần với sai mật khẩu<br>2. Thử lần 7 |
| **Kết quả mong đợi** | Status 403 sau 5 lần fail, "Account is locked" |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-07: SQL Injection trong login

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-07 |
| **Chức năng** | AUTH - Chống SQL Injection |
| **Tiền điều kiện** | Không có |
| **Bước thực hiện** | 1. POST /api/auth/login<br>2. Body: `{ email: "admin'--", password: "anything" }` |
| **Kết quả mong đợi** | Status 401, không có SQL error, không bypass authentication |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-08: JWT Token hết hạn

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-08 |
| **Chức năng** | AUTH - JWT validation |
| **Tiền điều kiện** | Có expired JWT token |
| **Bước thực hiện** | 1. GET /api/auth/me<br>2. Header: `Authorization: Bearer <expired_token>` |
| **Kết quả mong đợi** | Status 401, message "Invalid or expired token" |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

---

## LISTING - Quản lý tin đăng (TC-09 → TC-16)

### TC-09: Tạo listing thành công

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-09 |
| **Chức năng** | LISTING - Tạo tin đăng |
| **Tiền điều kiện** | Đã đăng nhập với token hợp lệ |
| **Bước thực hiện** | 1. POST /api/listings<br>2. Header: `Authorization: Bearer <token>`<br>3. Body: `{ title: "Test Book", description: "Test description", price: 100000, condition: "NEW", categoryId: 1 }` |
| **Kết quả mong đợi** | Status 201, trả về listing với id |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-10: Tạo listing không đăng nhập

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-10 |
| **Chức năng** | LISTING - Authorization |
| **Tiền điều kiện** | Không đăng nhập |
| **Bước thực hiện** | 1. POST /api/listings<br>2. Không có Authorization header |
| **Kết quả mong đợi** | Status 401 Unauthorized |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-11: XSS trong mô tả listing

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-11 |
| **Chức năng** | LISTING - Chống XSS |
| **Tiền điều kiện** | Đã đăng nhập |
| **Bước thực hiện** | 1. POST /api/listings<br>2. Body: `{ title: "<script>alert('XSS')</script>", description: "Test", price: 100000, condition: "NEW" }` |
| **Kết quả mong đợi** | Validation error hoặc sanitize input, không lưu script tag |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-12: Upload file nguy hiểm (executable)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-12 |
| **Chức năng** | LISTING - File upload security |
| **Tiền điều kiện** | Đã đăng nhập |
| **Bước thực hiện** | 1. POST /api/listings/{id}/images<br>2. Upload file: virus.exe |
| **Kết quả mong đợi** | Status 400, "Invalid file type", file bị từ chối |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-13: Upload file vượt kích thước cho phép

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-13 |
| **Chức năng** | LISTING - File size limit |
| **Tiền điều kiện** | Đã đăng nhập |
| **Bước thực hiện** | 1. POST /api/listings/{id}/images<br>2. Upload file 10MB |
| **Kết quả mong đợi** | Status 400, "File too large" |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-14: Chỉnh sửa listing của người khác

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-14 |
| **Chức năng** | LISTING - IDOR protection |
| **Tiền điều kiện** | User A tạo listing, User B đăng nhập |
| **Bước thực hiện** | 1. PATCH /api/listings/{listing_id_của_A}<br>2. Header: Authorization của User B |
| **Kết quả mong đợi** | Status 403 Forbidden |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-15: Giá âm

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-15 |
| **Chức năng** | LISTING - Validation |
| **Tiền điều kiện** | Đã đăng nhập |
| **Bước thực hiện** | 1. POST /api/listings<br>2. Body: `{ price: -10000 }` |
| **Kết quả mong đợi** | Status 400, validation error |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-16: Upload ảnh không hợp lệ (MIME type)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-16 |
| **Chức năng** | LISTING - MIME validation |
| **Tiền điều kiện** | Đã đăng nhập |
| **Bước thực hiện** | 1. POST /api/listings/{id}/images<br>2. Upload file text/plain với extension .jpg |
| **Kết quả mong đợi** | Status 400, "Invalid file type" |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

---

## SEARCH - Tìm kiếm (TC-17 → TC-21)

### TC-17: Tìm kiếm với từ khóa hợp lệ

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-17 |
| **Chức năng** | SEARCH - Tìm kiếm cơ bản |
| **Tiền điều kiện** | Có listings trong database |
| **Bước thực hiện** | 1. GET /api/listings?search=lap+trinh |
| **Kết quả mong đợi** | Status 200, trả về danh sách listings liên quan |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-18: Tìm kiếm với ký tự đặc biệt

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-18 |
| **Chức năng** | SEARCH - SQL Injection attempt |
| **Tiền điều kiện** | Không có |
| **Bước thực hiện** | 1. GET /api/listings?search='; DROP TABLE users; -- |
| **Kết quả mong đợi** | Status 200, không có lỗi SQL, không có data loss |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-19: Tìm kiếm với XSS payload

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-19 |
| **Chức năng** | SEARCH - XSS prevention |
| **Tiền điều kiện** | Không có |
| **Bước thực hiện** | 1. GET /api/listings?search=<script>alert('XSS')</script> |
| **Kết quả mong đợi** | Status 200, script tag được encode/sanitize |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-20: Tìm kiếm không có kết quả

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-20 |
| **Chức năng** | SEARCH - Empty result |
| **Tiền điều kiện** | Không có listing nào match |
| **Bước thực hiện** | 1. GET /api/listings?search=xyznonexistent123 |
| **Kết quả mong đợi** | Status 200, trả về mảng rỗng `[]` |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-21: Lọc theo category và university

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-21 |
| **Chức năng** | SEARCH - Filter |
| **Tiền điều kiện** | Có listings với nhiều categories |
| **Bước thực hiện** | 1. GET /api/listings?categoryId=1&universityId=2 |
| **Kết quả mong đợi** | Status 200, chỉ listings thuộc category 1 và university 2 |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

---

## CART - Giỏ hàng (TC-22 → TC-26)

### TC-22: Thêm sản phẩm vào giỏ hàng

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-22 |
| **Chức năng** | CART - Thêm sản phẩm |
| **Tiền điều kiện** | Đã đăng nhập, có listing tồn tại |
| **Bước thực hiện** | 1. POST /api/cart/items<br>2. Body: `{ listingId: 1, quantity: 2 }` |
| **Kết quả mong đợi** | Status 201, cart updated với items |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-23: Thêm sản phẩm đã hết hàng

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-23 |
| **Chức năng** | CART - Out of stock |
| **Tiền điều kiện** | Listing có quantity = 0 |
| **Bước thực hiện** | 1. POST /api/cart/items<br>2. Body: `{ listingId: <out_of_stock_id>, quantity: 1 }` |
| **Kết quả mong đợi** | Status 400, "Product is out of stock" |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-24: Cập nhật số lượng vượt stock

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-24 |
| **Chức năng** | CART - Boundary case |
| **Tiền điều kiện** | Listing có quantity = 5 |
| **Bước thực hiện** | 1. PUT /api/cart/items/{id}<br>2. Body: `{ quantity: 100 }` |
| **Kết quả mong đợi** | Status 400, "Quantity exceeds available stock" |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-25: Xóa sản phẩm khỏi giỏ hàng

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-25 |
| **Chức năng** | CART - Remove item |
| **Tiền điều kiện** | Có item trong giỏ hàng |
| **Bước thực hiện** | 1. DELETE /api/cart/items/{cart_item_id} |
| **Kết quả mong đợi** | Status 200, item removed |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-26: Xem giỏ hàng của người khác (IDOR)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-26 |
| **Chức năng** | CART - IDOR |
| **Tiền điều kiện** | User A có items trong cart |
| **Bước thực hiện** | 1. GET /api/cart<br>2. Với User B token |
| **Kết quả mong đợi** | Status 200, chỉ thấy cart của User B |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

---

## ORDER - Đơn hàng (TC-27 → TC-33)

### TC-27: Tạo đơn hàng thành công

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-27 |
| **Chức năng** | ORDER - Happy path |
| **Tiền điều kiện** | Có items trong cart, đã đăng nhập |
| **Bước thực hiện** | 1. POST /api/orders<br>2. Body: `{ shippingAddress: "123 Test St", shippingPhone: "0901234567", shippingName: "Test User" }` |
| **Kết quả mong đợi** | Status 201, order tạo thành công, cart cleared |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-28: Tạo đơn hàng với giỏ hàng trống

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-28 |
| **Chức năng** | ORDER - Empty cart |
| **Tiền điều kiện** | Cart rỗng |
| **Bước thực hiện** | 1. POST /api/orders<br>2. Body: `{ shippingAddress: "123 Test St", shippingPhone: "0901234567", shippingName: "Test User" }` |
| **Kết quả mong đợi** | Status 400, "Cart is empty" |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-29: Tạo đơn hàng không đăng nhập

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-29 |
| **Chức năng** | ORDER - Unauthorized |
| **Tiền điều kiện** | Không đăng nhập |
| **Bước thực hiện** | 1. POST /api/orders<br>2. Không có Authorization header |
| **Kết quả mong đợi** | Status 401 Unauthorized |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-30: User thường truy cập admin order

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-30 |
| **Chức năng** | ORDER - RBAC |
| **Tiền điều kiện** | User thường đăng nhập |
| **Bước thực hiện** | 1. GET /api/admin/orders |
| **Kết quả mong đợi** | Status 403 Forbidden |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-31: Xem đơn hàng của người khác (IDOR)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-31 |
| **Chức năng** | ORDER - IDOR |
| **Tiền điều kiện** | User A có order, User B đăng nhập |
| **Bước thực hiện** | 1. GET /api/orders/{order_id_của_A} |
| **Kết quả mong đợi** | Status 403 Forbidden hoặc 404 Not Found |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-32: Hủy đơn hàng bởi buyer

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-32 |
| **Chức năng** | ORDER - Cancel |
| **Tiền điều kiện** | Có order đang ở trạng thái PENDING_PAYMENT |
| **Bước thực hiện** | 1. PATCH /api/orders/{id}/status<br>2. Body: `{ status: "CANCELLED", reason: "Changed mind" }` |
| **Kết quả mong đợi** | Status 200, order status updated |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-33: Xác nhận đơn hàng bởi seller

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-33 |
| **Chức năng** | ORDER - Seller confirm |
| **Tiền điều kiện** | Có order mới, đăng nhập với tài khoản seller |
| **Bước thực hiện** | 1. PATCH /api/orders/{id}/status<br>2. Body: `{ status: "CONFIRMED" }` |
| **Kết quả mong đợi** | Status 200, order confirmed |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

---

## PAYMENT - Thanh toán (TC-34 → TC-38)

### TC-34: Thanh toán với ví đủ tiền

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-34 |
| **Chức năng** | PAYMENT - Happy path |
| **Tiền điều kiện** | Wallet có balance >= order total |
| **Bước thực hiện** | 1. POST /api/payments<br>2. Body: `{ orderId: 1, method: "WALLET" }` |
| **Kết quả mong đợi** | Status 200, payment successful, balance deducted |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-35: Thanh toán với ví không đủ tiền

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-35 |
| **Chức năng** | PAYMENT - Insufficient funds |
| **Tiền điều kiện** | Wallet có balance < order total |
| **Bước thực hiện** | 1. POST /api/payments<br>2. Body: `{ orderId: 1, method: "WALLET" }` |
| **Kết quả mong đợi** | Status 400, "Insufficient balance" |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-36: Thanh toán 2 lần cùng một đơn (duplicate request)

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-36 |
| **Chức năng** | PAYMENT - Duplicate prevention |
| **Tiền điều kiện** | Order đã thanh toán thành công |
| **Bước thực hiện** | 1. POST /api/payments với order đã paid (2 lần) |
| **Kết quả mong đợi** | Status 400, "Order already paid" |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-37: Nạp tiền vào ví

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-37 |
| **Chức năng** | PAYMENT - Deposit |
| **Tiền điều kiện** | Đã đăng nhập |
| **Bước thực hiện** | 1. POST /api/wallet/deposit<br>2. Body: `{ amount: 500000 }` |
| **Kết quả mong đợi** | Status 200, balance increased |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-38: Nạp tiền với số âm

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-38 |
| **Chức năng** | PAYMENT - Validation |
| **Tiền điều kiện** | Đã đăng nhập |
| **Bước thực hiện** | 1. POST /api/wallet/deposit<br>2. Body: `{ amount: -1000 }` |
| **Kết quả mong đợi** | Status 400, validation error |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

---

## ESCROW - Ký quỹ (TC-39 → TC-43)

### TC-39: Tiền được giữ sau thanh toán

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-39 |
| **Chức năng** | ESCROW - Hold after payment |
| **Tiền điều kiện** | Order đã thanh toán |
| **Bước thực hiện** | 1. Tạo order → 2. Thanh toán → 3. Kiểm tra escrow |
| **Kết quả mong đợi** | Tiền được chuyển vào escrow, không chuyển cho seller |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-40: Giải phóng escrow sau khi xác nhận

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-40 |
| **Chức năng** | ESCROW - Release |
| **Tiền điều kiện** | Order đang shipping, buyer đã xác nhận nhận hàng |
| **Bước thực hiện** | 1. Buyer xác nhận nhận hàng → 2. Kiểm tra seller wallet |
| **Kết quả mong đợi** | Tiền được chuyển từ escrow sang seller wallet |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-41: Tạo dispute escrow

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-41 |
| **Chức năng** | ESCROW - Dispute |
| **Tiền điều kiện** | Order đang trong escrow |
| **Bước thực hiện** | 1. POST /api/orders/{id}/dispute<br>2. Body: `{ reason: "Product not as described" }` |
| **Kết quả mong đợi** | Status 201, escrow on hold, order marked as disputed |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-42: Hoàn tiền từ escrow

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-42 |
| **Chức năng** | ESCROW - Refund |
| **Tiền điều kiện** | Order disputed và được resolve về phía buyer |
| **Bước thực hiện** | 1. Admin resolve dispute về buyer → 2. Kiểm tra buyer wallet |
| **Kết quả mong đợi** | Tiền được hoàn vào buyer wallet |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-43: Rút tiền từ ví

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-43 |
| **Chức năng** | ESCROW - Withdrawal |
| **Tiền điều kiện** | Wallet có balance >= 50000 |
| **Bước thực hiện** | 1. POST /api/wallet/withdraw<br>2. Body: `{ amount: 100000, bankAccount: "123456789" }` |
| **Kết quả mong đợi** | Status 200, withdrawal pending, balance deducted |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

---

## REVIEW - Đánh giá (TC-44 → TC-47)

### TC-44: Tạo review sau khi nhận hàng

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-44 |
| **Chức năng** | REVIEW - Happy path |
| **Tiền điều kiện** | Order đã COMPLETED |
| **Bước thực hiện** | 1. POST /api/orders/{id}/review<br>2. Body: `{ rating: 5, comment: "Great book!" }` |
| **Kết quả mong đợi** | Status 201, review created |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-45: Tạo review cho order chưa hoàn thành

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-45 |
| **Chức năng** | REVIEW - Invalid state |
| **Tiền điều kiện** | Order đang ở trạng thái SHIPPING |
| **Bước thực hiện** | 1. POST /api/orders/{id}/review |
| **Kết quả mong đợi** | Status 400, "Order must be completed before reviewing" |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-46: Review 2 lần cùng một order

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-46 |
| **Chức năng** | REVIEW - Duplicate |
| **Tiền điều kiện** | Đã có review cho order này |
| **Bước thực hiện** | 1. POST /api/orders/{id}/review (2 lần) |
| **Kết quả mong đợi** | Status 400, "Review already exists" |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-47: Rating không hợp lệ

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-47 |
| **Chức năng** | REVIEW - Validation |
| **Tiền điều kiện** | Order COMPLETED |
| **Bước thực hiện** | 1. POST /api/orders/{id}/review<br>2. Body: `{ rating: 10, comment: "Test" }` |
| **Kết quả mong đợi** | Status 400, rating phải từ 1-5 |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

---

## SECURITY - Bảo mật (TC-48 → TC-55)

### TC-48: Unauthorized API access

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-48 |
| **Chức năng** | SECURITY - Auth required |
| **Tiền điều kiện** | Không đăng nhập |
| **Bước thực hiện** | 1. GET /api/wallet |
| **Kết quả mong đợi** | Status 401 Unauthorized |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-49: Invalid token format

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-49 |
| **Chức năng** | SECURITY - JWT validation |
| **Tiền điều kiện** | Không có |
| **Bước thực hiện** | 1. GET /api/auth/me<br>2. Header: `Authorization: Bearer invalid-token` |
| **Kết quả mong đợi** | Status 401, "Invalid token" |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-50: Admin access với USER token

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-50 |
| **Chức năng** | SECURITY - RBAC |
| **Tiền điều kiện** | Đăng nhập với tài khoản USER |
| **Bước thực hiện** | 1. GET /api/admin/dashboard/stats |
| **Kết quả mong đợi** | Status 403 Forbidden |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-51: Password exposure check

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-51 |
| **Chức năng** | SECURITY - Data exposure |
| **Tiền điều kiện** | Đăng nhập thành công |
| **Bước thực hiện** | 1. POST /api/auth/login<br>2. Kiểm tra response body |
| **Kết quả mong đợi** | Response không chứa passwordHash hoặc password |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-52: Error message leakage

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-52 |
| **Chức năng** | SECURITY - Error handling |
| **Tiền điều kiện** | Không có |
| **Bước thực hiện** | 1. GET /api/users/999999 |
| **Kết quả mong đợi** | Response không chứa stack trace, internal paths |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-53: Rate limiting test

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-53 |
| **Chức năng** | SECURITY - Rate limiting |
| **Tiền điều kiện** | Không có |
| **Bước thực hiện** | 1. Gửi 15+ requests trong 1 phút đến /api/auth/login |
| **Kết quả mong đợi** | Request thứ 11+ trả về Status 429 Too Many Requests |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-54: Security headers presence

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-54 |
| **Chức năng** | SECURITY - Headers |
| **Tiền điều kiện** | Không có |
| **Bước thực hiện** | 1. GET /api/listings<br>2. Kiểm tra response headers |
| **Kết quả mong đợi** | Có headers: X-Content-Type-Options, X-Frame-Options |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

### TC-55: CORS configuration

| Trường | Nội dung |
|--------|----------|
| **Mã ca kiểm thử** | TC-55 |
| **Chức năng** | SECURITY - CORS |
| **Tiền điều kiện** | Không có |
| **Bước thực hiện** | 1. OPTIONS request từ origin khác |
| **Kết quả mong đợi** | Header Access-Control-Allow-Origin đúng whitelist |
| **Kết quả thực tế** | ⏸️ PENDING |
| **Kết luận** | ⏸️ PENDING |

---

## Tổng hợp kết quả

| Module | Tổng TC | ✅ Pass | ❌ Fail | ⏸️ Pending |
|--------|---------|--------|--------|------------|
| AUTH | 8 | 0 | 0 | 8 |
| LISTING | 8 | 0 | 0 | 8 |
| SEARCH | 5 | 0 | 0 | 5 |
| CART | 5 | 0 | 0 | 5 |
| ORDER | 7 | 0 | 0 | 7 |
| PAYMENT | 5 | 0 | 0 | 5 |
| ESCROW | 5 | 0 | 0 | 5 |
| REVIEW | 4 | 0 | 0 | 4 |
| SECURITY | 8 | 0 | 0 | 8 |
| **TỔNG** | **55** | **0** | **0** | **55** |

---

## Hướng dẫn chạy test

### Backend Unit Tests
```bash
cd backend
npm run test
```

### Backend Integration Tests
```bash
npm run test:e2e
```

### Security Tests
```bash
npm run test -- --testPathPattern=security.spec.ts
```

---

*Lần cập nhật: 2026-09-25*
