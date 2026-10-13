/**
 * Legal Pages - Transaction Conditions
 * 
 * Điều kiện và quy trình giao dịch
 */

import { Link } from 'react-router-dom';
import SEOMeta from '../../components/seo/SEOMeta';

export default function TransactionConditionsPage() {
  return (
    <>
      <SEOMeta
        title="Điều kiện giao dịch"
        description="Điều kiện và quy trình giao dịch trên SachGiaRe.vn"
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Điều kiện Giao dịch</h1>
        <p className="text-gray-500 mb-6">
          Quy định về quy trình và điều kiện giao dịch trên nền tảng
        </p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Quy trình giao dịch</h2>
            <p className="text-gray-600 mb-4">
              Mọi giao dịch trên SachGiaRe.vn tuân theo quy trình sau:
            </p>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-bold">1</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Xem sản phẩm</h3>
                  <p className="text-gray-600">Người mua xem thông tin sản phẩm, hình ảnh, giá cả và mô tả</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-bold">2</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Xác nhận thông tin</h3>
                  <p className="text-gray-600">Người mua nhập và xác nhận thông tin giao hàng, số lượng</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-bold">3</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Xem lại đơn hàng</h3>
                  <p className="text-gray-600">Người mua kiểm tra tất cả thông tin trước khi đặt</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-bold">4</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Xác nhận đặt hàng</h3>
                  <p className="text-gray-600">Người mua xác nhận đặt hàng và chấp nhận điều khoản</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-bold">5</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Thanh toán</h3>
                  <p className="text-gray-600">Người mua thực hiện thanh toán qua ví điện tử</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-bold">6</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Xác nhận đơn hàng</h3>
                  <p className="text-gray-600">Hệ thống tạo đơn hàng và gửi xác nhận cho các bên</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-bold">7</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Giao hàng</h3>
                  <p className="text-gray-600">Người bán đóng gói và giao hàng cho người mua</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Hoàn tất</h3>
                  <p className="text-gray-600">Người mua xác nhận nhận hàng, tiền được chuyển cho người bán</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Điều kiện đặt hàng</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-2">2.1 Với người mua</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Phải có tài khoản đã đăng ký và đăng nhập</li>
              <li>Thông tin cá nhân phải chính xác và đầy đủ</li>
              <li>Phải đủ điều kiện thanh toán</li>
              <li>Cam kết nhận hàng khi đặt</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-2">2.2 Với người bán</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Sản phẩm phải đúng như mô tả</li>
              <li>Phải có đủ hàng để giao</li>
              <li>Giao hàng trong thời hạn thỏa thuận</li>
              <li>Đóng gói an toàn, đúng cách</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-2">2.3 Với sản phẩm</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Sản phẩm phải hợp pháp, không vi phạm bản quyền</li>
              <li>Không thuộc danh mục cấm kinh doanh</li>
              <li>Hình ảnh và mô tả phải trung thực</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Thanh toán</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-2">3.1 Phương thức thanh toán</h3>
            <table className="min-w-full border-collapse border border-gray-300 mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Phương thức</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Mô tả</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Ví SachGiaRe</td>
                  <td className="border border-gray-300 px-4 py-2">Nạp tiền trước, thanh toán nhanh chóng</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Chuyển khoản</td>
                  <td className="border border-gray-300 px-4 py-2">ATM/Internet Banking qua ví trung gian</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl font-medium text-gray-800 mb-2">3.2 Quy trình thanh toán</h3>
            <ol className="list-decimal pl-6 text-gray-600 space-y-2 mb-4">
              <li>Người mua chọn sản phẩm và tiến hành checkout</li>
              <li>Hệ thống hiển thị tổng số tiền cần thanh toán</li>
              <li>Người mua chọn phương thức và xác nhận thanh toán</li>
              <li>Tiền được giữ trong hệ thống (escrow) cho đến khi xác nhận</li>
              <li>Khi người mua xác nhận nhận hàng, tiền mới được chuyển cho người bán</li>
            </ol>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">
                <strong>Lưu ý:</strong> Tất cả thanh toán trên SachGiaRe.vn là MÔ PHỎNG 
                trong môi trường bài tập sinh viên. Không có tiền thật.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Xác nhận giao dịch</h2>
            <p className="text-gray-600 mb-4">
              Mỗi giao dịch được xác nhận bằng:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Mã đơn hàng duy nhất</li>
              <li>Email xác nhận gửi đến người mua và người bán</li>
              <li>Thời gian xác nhận đặt hàng</li>
              <li>Phiên bản điều khoản đã chấp nhận</li>
              <li>Lịch sử giao dịch trong tài khoản</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Trách nhiệm các bên</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-2">5.1 SachGiaRe.vn</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Cung cấp nền tảng giao dịch an toàn</li>
              <li>Lưu trữ thông tin giao dịch</li>
              <li>Hỗ trợ giải quyết tranh chấp</li>
              <li>Đảm bảo tính bảo mật thông tin</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-2">5.2 Người bán</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Giao sản phẩm đúng như mô tả</li>
              <li>Giao hàng đúng thời hạn</li>
              <li>Chịu trách nhiệm về chất lượng sản phẩm</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-2">5.3 Người mua</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Kiểm tra sản phẩm khi nhận</li>
              <li>Thanh toán đúng và đủ</li>
              <li>Báo cáo vấn đề trong thời hạn quy định</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Phí giao dịch</h2>
            <p className="text-gray-600 mb-4">
              Phí dịch vụ được áp dụng trên mỗi giao dịch thành công:
            </p>
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Loại phí</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Mức phí</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Người chịu phí</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Phí dịch vụ</td>
                  <td className="border border-gray-300 px-4 py-2">5% giá trị đơn hàng</td>
                  <td className="border border-gray-300 px-4 py-2">Người bán</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Phí thanh toán</td>
                  <td className="border border-gray-300 px-4 py-2">Miễn phí</td>
                  <td className="border border-gray-300 px-4 py-2">-</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Phí vận chuyển</td>
                  <td className="border border-gray-300 px-4 py-2">Theo thỏa thuận</td>
                  <td className="border border-gray-300 px-4 py-2">Người mua</td>
                </tr>
              </tbody>
            </table>
          </section>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>Lưu ý quan trọng:</strong> Đây là môi trường mô phỏng (sandbox) cho bài tập sinh viên. 
              Điều kiện giao dịch trên được thiết kế nhằm đáp ứng yêu cầu của bài tập và cần được 
              rà soát theo quy định hiện hành khi triển khai thực tế.
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <Link to="/refund-policy" className="text-primary-600 hover:text-primary-700">
            ← Chính sách đổi trả
          </Link>
          <Link to="/seller-information" className="text-primary-600 hover:text-primary-700">
            Thông tin người bán →
          </Link>
        </div>
      </div>
    </>
  );
}
