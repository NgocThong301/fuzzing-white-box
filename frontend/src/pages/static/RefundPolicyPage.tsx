/**
 * Legal Pages - Refund Policy
 * 
 * Chính sách đổi trả và hoàn tiền
 */

import { Link } from 'react-router-dom';
import SEOMeta from '../../components/seo/SEOMeta';

export default function RefundPolicyPage() {
  return (
    <>
      <SEOMeta
        title="Chính sách đổi trả"
        description="Chính sách đổi trả và hoàn tiền - SachGiaRe.vn"
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chính sách Đổi trả & Hoàn tiền</h1>
        <p className="text-gray-500 mb-6">
          Cập nhật: 01/01/2026
        </p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Mục tiêu</h2>
            <p className="text-gray-600">
              Chúng tôi cam kết bảo vệ quyền lợi người tiêu dùng và đảm bảo mọi giao dịch 
              diễn ra công bằng, minh bạch. Chính sách này nhằm hướng dẫn quy trình đổi trả 
              và hoàn tiền trên nền tảng SachGiaRe.vn.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Điều kiện đổi trả</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-2">2.1 Đổi trả do lỗi từ sản phẩm</h3>
            <p className="text-gray-600 mb-4">
              Người mua được đổi trả trong các trường hợp sau:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Sách bị rách, hỏng do vận chuyển</li>
              <li>Sách không đúng với mô tả trên website</li>
              <li>Thiếu trang, thiếu nội dung so với sách gốc</li>
              <li>Sách là bản sao không rõ ràng</li>
              <li>Giao nhầm sản phẩm</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-2">2.2 Không áp dụng đổi trả</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Sách đã qua sử dụng, viết hoặc tô vẽ</li>
              <li>Sách không còn nguyên vẹn bao bì (nếu có)</li>
              <li>Lỗi được ghi rõ trong mô tả (vd: "hơi ố vàng")</li>
              <li>Người mua đổi ý sau khi nhận hàng</li>
              <li>Đơn hàng bị hủy theo yêu cầu người mua</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-2">2.3 Thời hạn đổi trả</h3>
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Loại lỗi</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Thời hạn</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Lỗi do vận chuyển</td>
                  <td className="border border-gray-300 px-4 py-2">48 giờ sau khi nhận hàng</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Sách không đúng mô tả</td>
                  <td className="border border-gray-300 px-4 py-2">48 giờ sau khi nhận hàng</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Giao nhầm</td>
                  <td className="border border-gray-300 px-4 py-2">48 giờ sau khi nhận hàng</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Quy trình đổi trả</h2>
            
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">1</div>
                <p className="text-sm text-gray-700">Người mua gửi yêu cầu kèm ảnh</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">2</div>
                <p className="text-sm text-gray-700">SachGiaRe xác minh trong 24h</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
                <p className="text-sm text-gray-700">Người bán xác nhận/phản hồi</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">4</div>
                <p className="text-sm text-gray-700">Hoàn tiền (nếu được duyệt)</p>
              </div>
            </div>

            <h3 className="text-xl font-medium text-gray-800 mb-2">3.1 Yêu cầu cần cung cấp</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Mã đơn hàng</li>
              <li>Lý do đổi trả</li>
              <li>Hình ảnh sản phẩm thực tế</li>
              <li>Hình ảnh mô tả trên website (để so sánh)</li>
              <li>Số tài khoản nhận hoàn tiền (nếu cần)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Hoàn tiền</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-2">4.1 Phương thức hoàn tiền</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Ví SachGiaRe (khuyến nghị - hoàn trong 24h)</li>
              <li>Chuyển khoản ngân hàng (3-5 ngày làm việc)</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-2">4.2 Số tiền hoàn</h3>
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Trường hợp</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Số tiền hoàn</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Lỗi từ người bán</td>
                  <td className="border border-gray-300 px-4 py-2">100% giá trị sách + phí ship</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Giao nhầm</td>
                  <td className="border border-gray-300 px-4 py-2">100% giá trị sách + phí ship</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Người mua đổi ý</td>
                  <td className="border border-gray-300 px-4 py-2">Theo thỏa thuận với người bán</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl font-medium text-gray-800 mb-2">4.3 Thời gian hoàn tiền</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Xác nhận duyệt hoàn: Trong vòng 48 giờ</li>
              <li>Hoàn qua ví: Trong 24 giờ sau khi duyệt</li>
              <li>Hoàn qua ngân hàng: 3-5 ngày làm việc</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Tranh chấp</h2>
            <p className="text-gray-600 mb-4">
              Trong trường hợp người mua và người bán không thể thống nhất:
            </p>
            <ol className="list-decimal pl-6 text-gray-600 space-y-2">
              <li>SachGiaRe sẽ tiếp nhận và xem xét bằng chứng từ cả hai bên</li>
              <li>Quyết định của SachGiaRe là quyết định cuối cùng trong phạm vi bài tập</li>
              <li>Các bên có thể tham khảo ý kiến cơ quan bảo vệ người tiêu dùng</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Liên hệ</h2>
            <p className="text-gray-600 mb-4">
              Để yêu cầu đổi trả, vui lòng:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Gửi yêu cầu qua mục "Hỗ trợ" trên website</li>
              <li>Email: support@sachgiare.vn</li>
              <li>Hotline: 1900-xxxx (8:00 - 22:00 các ngày làm việc)</li>
            </ul>
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
          <Link to="/personal-data-policy" className="text-primary-600 hover:text-primary-700">
            ← Chính sách dữ liệu cá nhân
          </Link>
          <Link to="/transaction-conditions" className="text-primary-600 hover:text-primary-700">
            Điều kiện giao dịch →
          </Link>
        </div>
      </div>
    </>
  );
}
