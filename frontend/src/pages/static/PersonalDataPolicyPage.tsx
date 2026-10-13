/**
 * Legal Pages - Personal Data Policy
 * 
 * Chính sách dữ liệu cá nhân
 * Chi tiết về quyền và cách xử lý dữ liệu
 */

import { Link } from 'react-router-dom';
import SEOMeta from '../../components/seo/SEOMeta';

export default function PersonalDataPolicyPage() {
  return (
    <>
      <SEOMeta
        title="Chính sách dữ liệu cá nhân"
        description="Chính sách dữ liệu cá nhân - SachGiaRe.vn - Bảo vệ quyền riêng tư người dùng"
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chính sách Dữ liệu Cá nhân</h1>
        <p className="text-gray-500 mb-6">
          Phiên bản 1.0 • Có hiệu lực từ ngày 01/01/2026
        </p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Giới thiệu</h2>
            <p className="text-gray-600 mb-4">
              SachGiaRe.vn cam kết bảo vệ dữ liệu cá nhân của người dùng theo đúng 
              quy định của pháp luật về bảo vệ dữ liệu cá nhân.
            </p>
            <p className="text-gray-600">
              Chính sách này mô tả chi tiết cách chúng tôi thu thập, xử lý, lưu trữ 
              và bảo vệ dữ liệu cá nhân của bạn.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Dữ liệu cá nhân được thu thập</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-2">2.1 Dữ liệu cơ bản</h3>
            <table className="min-w-full border-collapse border border-gray-300 mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Loại dữ liệu</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Mục đích</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Họ và tên</td>
                  <td className="border border-gray-300 px-4 py-2">Nhận diện người dùng, giao hàng</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Email</td>
                  <td className="border border-gray-300 px-4 py-2">Liên hệ, thông báo</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Số điện thoại</td>
                  <td className="border border-gray-300 px-4 py-2">Liên hệ giao hàng, hỗ trợ</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Địa chỉ</td>
                  <td className="border border-gray-300 px-4 py-2">Giao hàng, thanh toán</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl font-medium text-gray-800 mb-2">2.2 Dữ liệu nhạy cảm</h3>
            <p className="text-gray-600 mb-4">
              Chúng tôi KHÔNG thu thập các dữ liệu nhạy cảm như:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-4">
              <li>Thông tin tài khoản ngân hàng thật</li>
              <li>Số CMND/CCCD</li>
              <li>Dữ liệu sức khỏe</li>
              <li>Quan điểm chính trị, tôn giáo</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-2">2.3 Dữ liệu tự động</h3>
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Dữ liệu</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Mục đích</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Địa chỉ IP</td>
                  <td className="border border-gray-300 px-4 py-2">Bảo mật, thống kê</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Cookies</td>
                  <td className="border border-gray-300 px-4 py-2">Trải nghiệm người dùng</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Device ID</td>
                  <td className="border border-gray-300 px-4 py-2">Nhận diện thiết bị</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Quyền của chủ dữ liệu</h2>
            <p className="text-gray-600 mb-4">
              Bạn có các quyền sau theo quy định pháp luật:
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Quyền được thông báo</h3>
                <p className="text-sm text-gray-600">
                  Được biết về việc thu thập và sử dụng dữ liệu cá nhân
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Quyền truy cập</h3>
                <p className="text-sm text-gray-600">
                  Yêu cầu xem, sao chép dữ liệu cá nhân của mình
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Quyền chỉnh sửa</h3>
                <p className="text-sm text-gray-600">
                  Yêu cầu sửa dữ liệu không chính xác
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Quyền xóa</h3>
                <p className="text-sm text-gray-600">
                  Yêu cầu xóa dữ liệu khi không còn cần thiết
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Quyền phản đối</h3>
                <p className="text-sm text-gray-600">
                  Phản đối việc xử lý dữ liệu cho mục đích cụ thể
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Quyền di chuyển</h3>
                <p className="text-sm text-gray-600">
                  Yêu cầu xuất dữ liệu ở định dạng phổ biến
                </p>
              </div>
            </div>

            <p className="text-gray-600">
              <strong>Cách thực hiện:</strong> Gửi email đến privacy@sachgiare.vn hoặc 
              sử dụng tính năng trong phần "Tài khoản {'\u003E'} Quyền riêng tư".
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Thời gian xử lý yêu cầu</h2>
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Loại yêu cầu</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Thời gian xử lý</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Truy cập dữ liệu</td>
                  <td className="border border-gray-300 px-4 py-2">72 giờ</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Chỉnh sửa dữ liệu</td>
                  <td className="border border-gray-300 px-4 py-2">48 giờ</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Xóa dữ liệu</td>
                  <td className="border border-gray-300 px-4 py-2">7 ngày làm việc</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Xuất dữ liệu</td>
                  <td className="border border-gray-300 px-4 py-2">7 ngày làm việc</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Bảo vệ dữ liệu</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Mã hóa dữ liệu nhạy cảm (AES-256)</li>
              <li>Xác thực hai yếu tố (2FA)</li>
              <li>Kiểm soát truy cập dựa trên vai trò</li>
              <li>Giám sát và ghi log truy cập</li>
              <li>Đào tạo nhân viên về bảo mật</li>
              <li>Kiểm thử bảo mật định kỳ</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Báo cáo vi phạm</h2>
            <p className="text-gray-600 mb-4">
              Trong trường hợp xảy ra vi phạm dữ liệu, chúng tôi sẽ:
            </p>
            <ol className="list-decimal pl-6 text-gray-600 space-y-2">
              <li>Thông báo cho cơ quan chức năng trong vòng 72 giờ</li>
              <li>Thông báo cho người dùng bị ảnh hưởng</li>
              <li>Điều tra và khắc phục ngay lập tức</li>
              <li>Cập nhật chính sách nếu cần thiết</li>
            </ol>
          </section>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>Lưu ý quan trọng:</strong> Đây là môi trường mô phỏng (sandbox) cho bài tập sinh viên. 
              Chính sách trên được thiết kế nhằm đáp ứng yêu cầu của bài tập và cần được 
              rà soát theo quy định hiện hành khi triển khai thực tế.
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <Link to="/privacy-policy" className="text-primary-600 hover:text-primary-700">
            ← Chính sách bảo mật
          </Link>
          <Link to="/refund-policy" className="text-primary-600 hover:text-primary-700">
            Chính sách đổi trả →
          </Link>
        </div>
      </div>
    </>
  );
}
