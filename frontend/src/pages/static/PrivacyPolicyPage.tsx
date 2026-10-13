/**
 * Legal Pages - Privacy Policy
 * 
 * Chính sách bảo mật thông tin
 * Tuân thủ: Luật Bảo vệ dữ liệu cá nhân
 */

import { Link } from 'react-router-dom';
import SEOMeta from '../../components/seo/SEOMeta';

const CURRENT_VERSION = '1.0';
const EFFECTIVE_DATE = '2026-01-01';

export default function PrivacyPolicyPage() {
  return (
    <>
      <SEOMeta
        title="Chính sách bảo mật"
        description="Chính sách bảo mật thông tin cá nhân - SachGiaRe.vn"
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chính sách bảo mật</h1>
        <p className="text-gray-500 mb-6">
          Phiên bản {CURRENT_VERSION} • Có hiệu lực từ ngày {EFFECTIVE_DATE}
        </p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Mục đích</h2>
            <p className="text-gray-600 mb-4">
              SachGiaRe.vn cam kết bảo vệ quyền riêng tư và bảo mật thông tin cá nhân 
              của người dùng. Chính sách này giải thích cách chúng tôi thu thập, sử dụng, 
              lưu trữ và bảo vệ thông tin của bạn.
            </p>
            <p className="text-gray-600">
              Chúng tôi thu thập thông tin để cung cấp dịch vụ tốt hơn và tuân thủ 
              các quy định pháp luật về bảo vệ dữ liệu cá nhân.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Thông tin thu thập</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-2">2.1 Thông tin bạn cung cấp</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Họ và tên</li>
              <li>Địa chỉ email</li>
              <li>Số điện thoại</li>
              <li>Địa chỉ giao hàng</li>
              <li>Thông tin thanh toán (mô phỏng)</li>
              <li>Avatar/Hình ảnh cá nhân (tùy chọn)</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-2">2.2 Thông tin tự động thu thập</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Địa chỉ IP</li>
              <li>Loại trình duyệt</li>
              <li>Thiết bị truy cập</li>
              <li>Trang web giới thiệu</li>
              <li>Hoạt động trên website</li>
              <li>Cookies và dữ liệu phiên</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-2">2.3 Thông tin từ bên thứ ba</h3>
            <p className="text-gray-600">
              Chúng tôi có thể nhận thông tin từ các bên thứ ba như đối tác xác thực 
              hoặc dịch vụ xác minh danh tính (nếu có).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Mục đích sử dụng</h2>
            <p className="text-gray-600 mb-4">
              Thông tin của bạn được sử dụng cho các mục đích sau:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Tạo và quản lý tài khoản người dùng</li>
              <li>Xử lý giao dịch mua bán</li>
              <li>Giao hàng và theo dõi đơn hàng</li>
              <li>Hỗ trợ khách hàng</li>
              <li>Gửi thông báo về đơn hàng và tài khoản</li>
              <li>Cải thiện dịch vụ và trải nghiệm người dùng</li>
              <li>Phát hiện và ngăn chặn gian lận</li>
              <li>Tuân thủ nghĩa vụ pháp lý</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Cơ sở pháp lý</h2>
            <p className="text-gray-600 mb-4">
              Chúng tôi xử lý dữ liệu của bạn dựa trên các cơ sở pháp lý sau:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>
                <strong>Đồng ý:</strong> Khi bạn đăng ký tài khoản và chấp nhận điều khoản sử dụng
              </li>
              <li>
                <strong>Thực hiện hợp đồng:</strong> Để xử lý giao dịch mua bán giữa bạn và người bán
              </li>
              <li>
                <strong>Nghĩa vụ pháp lý:</strong> Để tuân thủ các quy định pháp luật
              </li>
              <li>
                <strong>Lợi ích hợp pháp:</strong> Để cải thiện dịch vụ và bảo mật
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Lưu trữ dữ liệu</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-2">5.1 Thời gian lưu trữ</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Thông tin tài khoản: Lưu trữ cho đến khi bạn xóa tài khoản</li>
              <li>Thông tin giao dịch: Lưu trữ tối thiểu 5 năm theo quy định kế toán</li>
              <li>Cookies: Tối đa 12 tháng</li>
              <li>Logs hoạt động: Tối thiểu 6 tháng</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-2">5.2 Nơi lưu trữ</h3>
            <p className="text-gray-600">
              Dữ liệu được lưu trữ trên máy chủ đặt tại Việt Nam hoặc các nước có 
              quy định bảo vệ dữ liệu tương đương.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Bảo mật dữ liệu</h2>
            <p className="text-gray-600 mb-4">
              Chúng tôi áp dụng các biện pháp bảo mật sau:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Mã hóa dữ liệu khi truyền tải (HTTPS)</li>
              <li>Mã hóa mật khẩu với bcrypt</li>
              <li>Kiểm soát truy cập nghiêm ngặt</li>
              <li>Giám sát hệ thống 24/7</li>
              <li>Sao lưu dữ liệu định kỳ</li>
              <li>Đào tạo nhân viên về bảo mật</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Quyền của người dùng</h2>
            <p className="text-gray-600 mb-4">
              Bạn có các quyền sau đối với dữ liệu cá nhân của mình:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>
                <strong>Truy cập:</strong> Yêu cầu xem thông tin cá nhân của bạn
              </li>
              <li>
                <strong>Chỉnh sửa:</strong> Yêu cầu sửa thông tin không chính xác
              </li>
              <li>
                <strong>Xóa:</strong> Yêu cầu xóa tài khoản và dữ liệu liên quan
              </li>
              <li>
                <strong>Hạn chế xử lý:</strong> Yêu cầu hạn chế việc xử lý dữ liệu
              </li>
              <li>
                <strong>Phản đối:</strong> Phản đối việc xử lý dữ liệu cho mục đích tiếp thị
              </li>
              <li>
                <strong>Di chuyển:</strong> Yêu cầu xuất dữ liệu của bạn
              </li>
            </ul>
            <p className="text-gray-600 mt-4">
              Để thực hiện các quyền trên, vui lòng liên hệ qua email hoặc sử dụng 
              tính năng trong phần "Tài khoản" của website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Chia sẻ dữ liệu</h2>
            <p className="text-gray-600 mb-4">
              Chúng tôi có thể chia sẻ thông tin của bạn với:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>
                <strong>Người bán:</strong> Thông tin cần thiết để giao hàng (địa chỉ, số điện thoại)
              </li>
              <li>
                <strong>Đối tác vận chuyển:</strong> Để giao hàng đến bạn
              </li>
              <li>
                <strong>Cơ quan chức năng:</strong> Khi có yêu cầu pháp lý
              </li>
              <li>
                <strong>Nhà cung cấp dịch vụ:</strong> Để vận hành hệ thống (theo thỏa thuận bảo mật)
              </li>
            </ul>
            <p className="text-gray-600 mt-4">
              Chúng tôi KHÔNG bán thông tin cá nhân của bạn cho bên thứ ba.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Cookies</h2>
            <p className="text-gray-600 mb-4">
              Website sử dụng cookies để:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Duy trì phiên đăng nhập</li>
              <li>Ghi nhớ sở thích người dùng</li>
              <li>Phân tích lưu lượng truy cập</li>
              <li>Cá nhân hóa nội dung</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Bạn có thể từ chối cookies qua cài đặt trình duyệt, tuy nhiên một số 
              tính năng có thể không hoạt động đầy đủ.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Liên hệ</h2>
            <p className="text-gray-600 mb-4">
              Nếu có câu hỏi về Chính sách bảo mật, vui lòng liên hệ:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> privacy@sachgiare.vn</p>
              <p className="text-gray-700"><strong>Hotline:</strong> 1900-xxxx</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Thay đổi chính sách</h2>
            <p className="text-gray-600">
              Chúng tôi có thể cập nhật Chính sách bảo mật này. Thông báo sẽ được 
              đăng trên website kèm ngày có hiệu lực. Bạn nên kiểm tra định kỳ 
              để cập nhật thông tin mới nhất.
            </p>
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
          <Link to="/terms" className="text-primary-600 hover:text-primary-700">
            ← Điều khoản sử dụng
          </Link>
          <Link to="/personal-data-policy" className="text-primary-600 hover:text-primary-700">
            Chính sách dữ liệu cá nhân →
          </Link>
        </div>
      </div>
    </>
  );
}
