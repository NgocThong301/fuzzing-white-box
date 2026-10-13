/**
 * Legal Pages - Seller Information
 * 
 * Thông tin dành cho người bán
 */

import { Link } from 'react-router-dom';
import SEOMeta from '../../components/seo/SEOMeta';

export default function SellerInformationPage() {
  return (
    <>
      <SEOMeta
        title="Thông tin dành cho người bán"
        description="Hướng dẫn và điều kiện dành cho người bán trên SachGiaRe.vn"
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Thông tin dành cho Người bán</h1>
        <p className="text-gray-500 mb-6">
          Hướng dẫn đăng bán và quản lý gian hàng trên SachGiaRe.vn
        </p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Điều kiện trở thành người bán</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-2">1.1 Yêu cầu cơ bản</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Có tài khoản đã đăng ký và xác thực trên SachGiaRe.vn</li>
              <li>Từ 16 tuổi trở lên</li>
              <li>Cung cấp thông tin cá nhân chính xác</li>
              <li>Cam kết tuân thủ điều khoản sử dụng</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-2">1.2 Cam kết của người bán</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Đăng bán sản phẩm hợp pháp</li>
              <li>Thông tin sản phẩm chính xác, trung thực</li>
              <li>Giao hàng đúng hạn</li>
              <li>Hỗ trợ người mua khi có vấn đề</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Quy định đăng sản phẩm</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-2">2.1 Sản phẩm được phép đăng bán</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Sách giáo trình các cấp</li>
              <li>Tài liệu học tập, tham khảo</li>
              <li>Sách kỹ năng, sách chuyên ngành</li>
              <li>Bài giảng, tập ghi chép (bản photo được phép)</li>
              <li>Sách điện tử (nếu có bản quyền)</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-2">2.2 Sản phẩm không được phép</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Sách vi phạm bản quyền, lậu</li>
              <li>Sách cấm lưu hành tại Việt Nam</li>
              <li>Sách nội dung độc hại, phản động</li>
              <li>Sách khiêu dâm</li>
              <li>Sách có nội dung mê tín dị đoan</li>
              <li>Các sản phẩm không liên quan đến sách giáo trình</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-2">2.3 Thông tin bắt buộc</h3>
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Thông tin</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Bắt buộc</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Tiêu đề</td>
                  <td className="border border-gray-300 px-4 py-2">✓</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Mô tả chi tiết</td>
                  <td className="border border-gray-300 px-4 py-2">✓</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Giá</td>
                  <td className="border border-gray-300 px-4 py-2">✓</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Hình ảnh thực tế</td>
                  <td className="border border-gray-300 px-4 py-2">✓</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Tình trạng sản phẩm</td>
                  <td className="border border-gray-300 px-4 py-2">✓</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Số lượng</td>
                  <td className="border border-gray-300 px-4 py-2">✓</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Thể loại/Danh mục</td>
                  <td className="border border-gray-300 px-4 py-2">✓</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Môn học/Khóa học</td>
                  <td className="border border-gray-300 px-4 py-2">✓</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Quy định về hình ảnh</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Hình ảnh phải là thực tế của sản phẩm (không dùng ảnh internet)</li>
              <li>Ảnh chất lượng cao, rõ ràng</li>
              <li>Kích thước tối thiểu: 500x500px</li>
              <li>Định dạng: JPG, PNG, WebP</li>
              <li>Kích thước file tối đa: 5MB</li>
              <li>Tối thiểu 1 hình, khuyến khích 3-5 hình</li>
              <li>Không chỉnh sửa ảnh gây hiểu lầm về tình trạng sản phẩm</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Quy định về giá</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Giá phải hợp lý, không cao hơn nhiều so với giá thị trường</li>
              <li>Giá đã bao gồm phí dịch vụ (5%)</li>
              <li>Phí vận chuyển được tính riêng</li>
              <li>Không được dump giá phá giá thị trường</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Quy định về giao hàng</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-2">5.1 Thời gian giao hàng</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Giao hàng trong vòng 3 ngày làm việc kể từ khi xác nhận đơn</li>
              <li>Thông báo cho người mua nếu cần thêm thời gian</li>
              <li>Cập nhật mã vận chuyển khi giao</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-2">5.2 Đóng gói</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Đóng gói cẩn thận, chống va đập</li>
              <li>Bọc nilon bảo vệ sách</li>
              <li>Không giao sách không đóng gói</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Phí dịch vụ</h2>
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Loại phí</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Mức phí</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Phí đăng tin</td>
                  <td className="border border-gray-300 px-4 py-2">Miễn phí</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Phí dịch vụ</td>
                  <td className="border border-gray-300 px-4 py-2">5% giá trị đơn hàng</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Phí thanh toán</td>
                  <td className="border border-gray-300 px-4 py-2">Miễn phí</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Thanh toán cho người bán</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-2">7.1 Quy trình thanh toán</h3>
            <ol className="list-decimal pl-6 text-gray-600 space-y-2 mb-4">
              <li>Người mua thanh toán → Tiền được giữ trong escrow</li>
              <li>Người bán giao hàng</li>
              <li>Người mua xác nhận nhận hàng</li>
              <li>Tiền được chuyển vào ví người bán (sau 24h xác nhận)</li>
            </ol>

            <h3 className="text-xl font-medium text-gray-800 mb-2">7.2 Rút tiền</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Tối thiểu rút: 50,000 VNĐ</li>
              <li>Phí rút: Miễn phí</li>
              <li>Thời gian xử lý: 24-48 giờ</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Xử lý vi phạm</h2>
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Vi phạm</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Hình thức xử lý</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Sản phẩm không đúng mô tả</td>
                  <td className="border border-gray-300 px-4 py-2">Cảnh cáo, gỡ tin, hoàn tiền cho người mua</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Giao hàng trễ (3 lần)</td>
                  <td className="border border-gray-300 px-4 py-2">Cảnh cáo, hạn chế đăng tin</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Đăng sản phẩm cấm</td>
                  <td className="border border-gray-300 px-4 py-2">Gỡ tin, khóa tài khoản</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Lừa đảo/Gian lận</td>
                  <td className="border border-gray-300 px-4 py-2">Khóa tài khoản vĩnh viễn, báo cơ quan chức năng</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Hỗ trợ người bán</h2>
            <p className="text-gray-600 mb-4">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Hotline: 1900-xxxx (8:00 - 22:00)</li>
              <li>Email: seller@sachgiare.vn</li>
              <li>Trung tâm trợ giúp trực tuyến</li>
              <li>Hướng dẫn đăng tin chi tiết</li>
            </ul>
          </section>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>Lưu ý quan trọng:</strong> Đây là môi trường mô phỏng (sandbox) cho bài tập sinh viên. 
              Thông tin trên được thiết kế nhằm đáp ứng yêu cầu của bài tập và cần được 
              rà soát theo quy định hiện hành khi triển khai thực tế.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <Link to="/transaction-conditions" className="text-primary-600 hover:text-primary-700">
            ← Điều kiện giao dịch
          </Link>
        </div>
      </div>
    </>
  );
}
