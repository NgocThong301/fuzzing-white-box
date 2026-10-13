/**
 * Legal Pages - Terms of Service
 * 
 * Điều khoản sử dụng dịch vụ
 * Tuân thủ: Luật Giao dịch điện tử, Luật TMĐT
 */

import { Link } from 'react-router-dom';
import SEOMeta from '../../components/seo/SEOMeta';

const CURRENT_VERSION = '1.0';
const EFFECTIVE_DATE = '2026-01-01';

export default function TermsPage() {
  return (
    <>
      <SEOMeta
        title="Điều khoản sử dụng"
        description="Điều khoản sử dụng dịch vụ SachGiaRe.vn - Nền tảng mua bán sách giáo trình"
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Điều khoản sử dụng</h1>
        <p className="text-gray-500 mb-6">
          Phiên bản {CURRENT_VERSION} • Có hiệu lực từ ngày {EFFECTIVE_DATE}
        </p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Giới thiệu</h2>
            <p className="text-gray-600 mb-4">
              Chào mừng bạn đến với SachGiaRe.vn. Bằng việc truy cập và sử dụng dịch vụ của chúng tôi, 
              bạn đồng ý tuân thủ và bị ràng buộc bởi các Điều khoản sử dụng này.
            </p>
            <p className="text-gray-600">
              SachGiaRe.vn là nền tảng kết nối người mua và người bán sách giáo trình, tài liệu học tập 
              giữa các sinh viên và người dùng trong cộng đồng học tập.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Định nghĩa</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>"Chúng tôi"</strong> - SachGiaRe.vn và các bên liên kết</li>
              <li><strong>"Người dùng"</strong> - Cá nhân đăng ký và sử dụng dịch vụ</li>
              <li><strong>"Người mua"</strong> - Người dùng mua sản phẩm</li>
              <li><strong>"Người bán"</strong> - Người dùng đăng tin bán sản phẩm</li>
              <li><strong>"Sản phẩm"</strong> - Sách giáo trình, tài liệu được đăng bán</li>
              <li><strong>"Đơn hàng"</strong> - Giao dịch mua bán được xác nhận</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Tài khoản người dùng</h2>
            <h3 className="text-xl font-medium text-gray-800 mb-2">3.1 Đăng ký</h3>
            <p className="text-gray-600 mb-4">
              Để sử dụng dịch vụ, bạn cần đăng ký tài khoản với thông tin chính xác và cập nhật. 
              Bạn phải từ đủ 16 tuổi trở lên để tạo tài khoản.
            </p>
            
            <h3 className="text-xl font-medium text-gray-800 mb-2">3.2 Trách nhiệm</h3>
            <p className="text-gray-600 mb-4">
              Bạn chịu trách nhiệm bảo mật tài khoản và mật khẩu. Mọi hoạt động dưới tài khoản của bạn 
              đều là trách nhiệm của bạn.
            </p>
            
            <h3 className="text-xl font-medium text-gray-800 mb-2">3.3 Thông tin chính xác</h3>
            <p className="text-gray-600">
              Bạn cam kết cung cấp thông tin cá nhân chính xác và cập nhật khi có thay đổi.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Quy định với Người bán</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-2">4.1 Đăng sản phẩm</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Thông tin sản phẩm phải chính xác, đầy đủ</li>
              <li>Không đăng sản phẩm vi phạm bản quyền, lậu</li>
              <li>Hình ảnh phải thật, không chỉnh sửa gây hiểu lầm</li>
              <li>Giá cả phải hợp lý, minh bạch</li>
              <li>Mô tả tình trạng sản phẩm trung thực</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-2">4.2 Giao hàng</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Giao hàng trong thời hạn đã thỏa thuận</li>
              <li>Đóng gói cẩn thận, an toàn</li>
              <li>Cung cấp mã vận chuyển khi có</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-2">4.3 Chống gian lận</h3>
            <p className="text-gray-600">
              Nghiêm cấm các hành vi đặt hàng giả, thanh toán không hợp lệ, 
              hoặc bất kỳ hình thức gian lận nào.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Quy định với Người mua</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-2">5.1 Thanh toán</h3>
            <p className="text-gray-600 mb-4">
              Người mua cam kết thanh toán đúng giá và đúng hạn. Thông tin thanh toán 
              phải hợp lệ và thuộc quyền sở hữu của người mua.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-2">5.2 Nhận hàng</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Nhận và kiểm tra sản phẩm khi giao hàng</li>
              <li>Báo cáo ngay nếu sản phẩm không đúng mô tả</li>
              <li>Không nhận hàng vi phạm pháp luật</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-2">5.3 Tranh chấp</h3>
            <p className="text-gray-600">
              Trong trường hợp có tranh chấp, người mua và người bán cố gắng giải quyết 
              thông qua thương lượng. SachGiaRe.vn hỗ trợ điều phối khi cần.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Chính sách thanh toán</h2>
            <p className="text-gray-600 mb-4">
              Thanh toán được thực hiện thông qua ví điện tử tích hợp. 
              Các phương thức thanh toán:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Ví SachGiaRe (nạp tiền trước)</li>
              <li>Chuyển khoản ngân hàng</li>
            </ul>
            <p className="text-gray-600 mt-4">
              <strong>Lưu ý:</strong> Tất cả giao dịch trên SachGiaRe.vn là MÔ PHỎNG 
              trong môi trường bài tập sinh viên. Không có tiền thật.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Bảo vệ người tiêu dùng</h2>
            <p className="text-gray-600 mb-4">
              Chúng tôi cam kết bảo vệ quyền lợi người tiêu dùng theo quy định pháp luật:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Thông tin sản phẩm minh bạch, chính xác</li>
              <li>Hỗ trợ giải quyết khiếu nại trong 48 giờ</li>
              <li>Chính sách đổi/trả hợp lý</li>
              <li>Bảo mật thông tin cá nhân</li>
              <li>Hỗ trợ khiếu nại tranh chấp</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Giới hạn trách nhiệm</h2>
            <p className="text-gray-600 mb-4">
              SachGiaRe.vn là nền tảng kết nối. Chúng tôi không phải là người bán trực tiếp 
              và không chịu trách nhiệm về:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Chất lượng sản phẩm của người bán</li>
              <li>Tranh chấp giữa người mua và người bán</li>
              <li>Thiệt hại gián tiếp</li>
              <li>Hành vi của bên thứ ba</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Sở hữu trí tuệ</h2>
            <p className="text-gray-600 mb-4">
              Mọi nội dung trên SachGiaRe.vn bao gồm văn bản, logo, thiết kế, phần mềm 
              đều thuộc quyền sở hữu của chúng tôi hoặc được cấp phép hợp lệ.
            </p>
            <p className="text-gray-600">
              Nghiêm cấm sao chép, phân phối lại nội dung khi chưa có sự đồng ý bằng văn bản.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Thay đổi điều khoản</h2>
            <p className="text-gray-600 mb-4">
              Chúng tôi có quyền thay đổi Điều khoản sử dụng. Thông báo sẽ được gửi qua email 
              hoặc đăng trên website ít nhất 7 ngày trước khi có hiệu lực.
            </p>
            <p className="text-gray-600">
              Việc tiếp tục sử dụng dịch vụ sau khi thay đổi đồng nghĩa với việc bạn chấp nhận 
              các điều khoản mới.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Luật áp dụng</h2>
            <p className="text-gray-600">
              Điều khoản này được điều chỉnh bởi pháp luật Việt Nam, bao gồm Luật Giao dịch 
              điện tử, Luật Thương mại điện tử và các văn bản hướng dẫn thi hành.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Thông tin liên hệ</h2>
            <p className="text-gray-600">
              Nếu có câu hỏi về Điều khoản sử dụng, vui lòng liên hệ:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> support@sachgiare.vn</p>
              <p className="text-gray-700"><strong>Hotline:</strong> 1900-xxxx</p>
              <p className="text-gray-700"><strong>Địa chỉ:</strong> [Địa chỉ công ty]</p>
            </div>
          </section>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>Lưu ý quan trọng:</strong> Đây là môi trường mô phỏng (sandbox) cho bài tập sinh viên. 
              Các điều khoản trên được thiết kế nhằm đáp ứng yêu cầu của bài tập và cần được 
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
