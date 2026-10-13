# Legal Compliance Documentation

## Overview

Thiết kế được xây dựng nhằm đáp ứng các yêu cầu được xác định trong phạm vi bài tập và cần được rà soát theo quy định hiện hành khi triển khai thực tế.

---

## 1. Pháp luật Giao dịch Điện tử

### 1.1 Luật Giao dịch điện tử (Luật số 51/2005/QH11)

| Yêu cầu | Triển khai | Ghi chú |
|----------|-----------|---------|
| Xác thực giao dịch | ✅ JWT tokens | Xác thực người dùng qua Bearer token |
| Lưu trữ thông tin giao dịch | ✅ AuditLog, Order history | Lưu trong database |
| Chữ ký điện tử | ⚠️ Tham chiếu | Cần bổ sung cho giao dịch thực tế |
| Xác nhận giao dịch | ✅ Email thông báo | Gửi notification khi tạo đơn |

### 1.2 Nghị định 52/2013/NĐ-CP về TMĐT

| Yêu cầu | Triển khai | Ghi chú |
|----------|-----------|---------|
| Thông báo đăng ký với Bộ Công Thương | ⚠️ Tham chiếu | Cần thực hiện khi triển khai thực tế |
| Cung cấp thông tin về website | ✅ Trang thông tin | /about, /contact |
| Quy định về hợp đồng điện tử | ✅ Terms of Service | /terms |
| Giải quyết khiếu nại | ✅ Trang refund policy | /refund-policy |

---

## 2. Pháp luật về Thương mại Điện tử

### 2.1 Nghị định 85/2021/NĐ-CP

| Yêu cầu | Triển khai | Ghi chú |
|----------|-----------|---------|
| Đăng ký hoạt động TMĐT | ⚠️ Tham chiếu | Cần đăng ký khi triển khai |
| Niêm yết giá | ✅ Hiển thị giá VND | Không bao gồm VAT nếu chưa đăng ký |
| Khuyến mại | ✅ Coupon system | Áp dụng mã giảm giá |
| Quảng cáo | ✅ Chính sách quảng cáo | Cần tuân thủ quy định |

### 2.2 Thông tư 38/2015/TT-BCT

| Yêu cầu | Triển khai | Ghi chú |
|----------|-----------|---------|
| Cung cấp thông tin sản phẩm | ✅ Product pages | Tiêu đề, mô tả, giá, hình ảnh |
| Hạn chế kinh doanh | ✅ Validation | Không cho phép sản phẩm cấm |
| Trách nhiệm nền tảng | ✅ Terms of Service | Xác định vai trò trung gian |

---

## 3. Bảo vệ Quyền lợi Người tiêu dùng

### 3.1 Luật Bảo vệ Quyền lợi Người tiêu dùng (Luật số 59/2010/QH12)

| Yêu cầu | Triển khai | Ghi chú |
|----------|-----------|---------|
| Thông tin minh bạch | ✅ Product details, seller info | Mô tả, tình trạng, giá cả |
| Chính sách đổi trả | ✅ /refund-policy | Chi tiết về điều kiện đổi trả |
| Hỗ trợ khiếu nại | ✅ Support system | Contact page, ticket system |
| Bồi thường | ⚠️ Tham chiếu | Cần xây dựng quy trình cụ thể |

### 3.2 Thông tư 37/2015/TT-BCT

| Yêu cầu | Triển khai | Ghi chú |
|----------|-----------|---------|
| Thời gian giao hàng | ✅ Hiển thị trong order | 3 ngày làm việc |
| Điều kiện đổi trả | ✅ Chi tiết trong policy | 48 giờ sau khi nhận |
| Hoàn tiền | ✅ Refund policy | 24h - 5 ngày làm việc |

### 3.3 Biện pháp bảo vệ người tiêu dùng

| Biện pháp | Triển khai | Status |
|------------|-----------|--------|
| Escrow system | ✅ Tiền được giữ đến khi xác nhận | ✅ |
| Dispute resolution | ✅ Admin hỗ trợ giải quyết | ✅ |
| Seller verification | ✅ Tài khoản xác thực | ✅ |
| Review system | ✅ Đánh giá từ người mua | ✅ |
| Buyer protection | ✅ Chính sách hoàn tiền | ✅ |

---

## 4. Bảo vệ Dữ liệu Cá nhân

### 4.1 Nghị định 13/2023/NĐ-CP về Bảo vệ Dữ liệu Cá nhân

| Yêu cầu | Triển khai | Ghi chú |
|----------|-----------|---------|
| Cơ sở pháp lý xử lý | ✅ Consent, contract, legal obligation | Chi tiết trong privacy policy |
| Quyền của chủ dữ liệu | ✅ /personal-data-policy | Liệt kê đầy đủ quyền |
| Thông báo thu thập | ✅ Privacy notice | Hiển thị khi đăng ký |
| Bảo mật dữ liệu | ✅ Mã hóa, access control | bcrypt, HTTPS |
| Lưu trữ dữ liệu | ✅ Có thời hạn | Theo quy định |
| Báo cáo vi phạm | ⚠️ Tham chiếu | Cần quy trình cụ thể |

### 4.2 Các quyền của người dùng

| Quyền | Triển khai | Ghi chú |
|-------|-----------|---------|
| Quyền được thông báo | ✅ Privacy policy | Chi tiết khi thu thập |
| Quyền truy cập | ✅ User profile page | Xem thông tin cá nhân |
| Quyền chỉnh sửa | ✅ Profile settings | Cập nhật thông tin |
| Quyền xóa | ✅ Account deletion | Xóa tài khoản |
| Quyền phản đối | ✅ Contact support | Gửi yêu cầu |
| Quyền di chuyển | ⚠️ Tham chiếu | Cần xuất dữ liệu |

### 4.3 Dữ liệu được thu thập

| Loại dữ liệu | Mục đích | Cơ sở pháp lý |
|--------------|----------|----------------|
| Họ tên | Nhận diện, giao hàng | Hợp đồng |
| Email | Liên hệ, xác thực | Đồng ý |
| SĐT | Liên hệ giao hàng | Hợp đồng |
| Địa chỉ | Giao hàng | Hợp đồng |
| IP, Device | Bảo mật | Lợi ích hợp pháp |
| Cookies | Trải nghiệm | Đồng ý |

---

## 5. Yêu cầu về Website TMĐT

### 5.1 Thông tin bắt buộc

| Thông tin | Triển khai | Đường dẫn |
|-----------|-----------|-----------|
| Tên doanh nghiệp | ✅ Trong footer | /about |
| Địa chỉ | ✅ Contact page | /contact |
| Số điện thoại | ✅ Contact page | /contact |
| Email | ✅ Contact page | /contact |
| Giấy phép | ⚠️ Tham chiếu | Cần bổ sung |
| Mã số thuế | ⚠️ Tham chiếu | Cần bổ sung |

### 5.2 Chính sách bắt buộc

| Chính sách | Triển khai | Đường dẫn |
|------------|-----------|-----------|
| Điều khoản sử dụng | ✅ | /terms |
| Chính sách bảo mật | ✅ | /privacy-policy |
| Chính sách đổi trả | ✅ | /refund-policy |
| Điều kiện giao dịch | ✅ | /transaction-conditions |
| Chính sách vận chuyển | ✅ | Trong refund-policy |
| Thông tin người bán | ✅ | /seller-information |

---

## 6. Checkout Flow Compliance

### 6.1 Yêu cầu theo Nghị định 85/2021

| Bước | Triển khai | Status |
|------|-----------|--------|
| 1. Xem sản phẩm | ✅ Hiển thị giỏ hàng | ✅ |
| 2. Nhập thông tin | ✅ Form shipping info | ✅ |
| 3. Xác nhận thông tin | ✅ Step 3 - Review | ✅ |
| 4. Xem lại đơn hàng | ✅ Order summary | ✅ |
| 5. Tổng tiền | ✅ Hiển thị rõ ràng | ✅ |
| 6. Chọn thanh toán | ✅ Multiple methods | ✅ |
| 7. Xác nhận đặt hàng | ✅ Multi-step confirmation | ✅ |
| 8. Tạo order | ✅ Backend tạo record | ✅ |
| 9. Kết quả | ✅ Success page | ✅ |

### 6.2 Lưu trữ theo quy định

| Thông tin | Triển khai | Mục đích |
|-----------|-----------|----------|
| Order confirmation timestamp | ✅ | Xác nhận thời điểm đặt |
| Accepted terms version | ✅ | Lưu phiên bản điều khoản |
| Accepted terms timestamp | ✅ | Thời điểm chấp nhận |
| Transaction records | ✅ | Lưu trong Order model |

### 6.3 Anti-Fraud Measures

| Biện pháp | Triển khai |
|-----------|-----------|
| Rate limiting | ✅ @nestjs/throttler |
| Account lockout | ✅ 5 failed attempts |
| CAPTCHA | ⚠️ Cần bổ sung |
| Transaction limits | ✅ Per transaction limits |

---

## 7. So sánh với các quy định

### 7.1 Compliance Checklist

| Nhóm yêu cầu | Tuân thủ | Chi tiết |
|--------------|---------|---------|
| **Luật Giao dịch điện tử** | ⚠️ 80% | Cần bổ sung chữ ký số |
| **Luật TMĐT** | ⚠️ 80% | Cần đăng ký với BCT |
| **Bảo vệ người tiêu dùng** | ✅ 90% | Đầy đủ chính sách |
| **Bảo vệ dữ liệu cá nhân** | ✅ 90% | Theo NĐ 13/2023 |

### 7.2 Gap Analysis

| Gap | Mức độ | Hành động cần thiết |
|-----|--------|---------------------|
| Chưa đăng ký với Bộ Công Thương | Cao | Thực hiện khi triển khai |
| Chưa có giấy phép kinh doanh | Cao | Bổ sung thông tin công ty |
| Chưa tích hợp chữ ký số | Trung bình | Cần partner eSign |
| Chưa có quy trình báo cáo vi phạm | Trung bình | Xây dựng SOP |
| Chưa xuất dữ liệu theo yêu cầu | Thấp | Phát triển thêm feature |

---

## 8. URLs bắt buộc theo quy định

| URL | Nội dung | Status |
|-----|----------|--------|
| /terms | Điều khoản sử dụng | ✅ |
| /privacy-policy | Chính sách bảo mật | ✅ |
| /personal-data-policy | Dữ liệu cá nhân | ✅ |
| /refund-policy | Chính sách đổi trả | ✅ |
| /transaction-conditions | Điều kiện giao dịch | ✅ |
| /seller-information | Thông tin người bán | ✅ |
| /contact | Liên hệ | ✅ |
| /about | Giới thiệu | ✅ |

---

## 9. Recommended Actions

### 9.1 Trước khi triển khai thực tế

1. **Đăng ký với Bộ Công Thương**
   - Hoàn tất hồ sơ đăng ký TMĐT
   - Cung cấp thông tin doanh nghiệp đầy đủ

2. **Bổ sung thông tin pháp lý**
   - Giấy phép kinh doanh
   - Mã số thuế
   - Địa chỉ công ty

3. **Tích hợp thanh toán**
   - Ký hợp đồng với payment gateway
   - Đảm bảo tuân thủ PCI-DSS

4. **Xây dựng SOP**
   - Quy trình xử lý khiếu nại
   - Quy trình báo cáo vi phạm dữ liệu
   - Quy trình hoàn tiền

### 9.2 Cải thiện UX/UI

1. Thêm CAPTCHA cho form đăng ký/đăng nhập
2. Thêm thông báo cookie consent
3. Cải thiện trang khiếu nại/dispute
4. Thêm tính năng xuất dữ liệu cá nhân

---

## 10. Document Version

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-09-25 | Initial version for academic project |

---

## Disclaimer

> **Quan trọng:** Tài liệu này được tạo cho mục đích bài tập sinh viên và không cấu thành tư vấn pháp lý.
> 
> Thiết kế được xây dựng nhằm đáp ứng các yêu cầu được xác định trong phạm vi bài tập và cần được rà soát theo quy định hiện hành khi triển khai thực tế.
> 
> Vui lòng tham khảo ý kiến chuyên gia pháp lý trước khi triển khai bất kỳ nền tảng TMĐT nào.

---

*Last Updated: 2026-09-25*
