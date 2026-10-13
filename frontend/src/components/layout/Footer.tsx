import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📚</span>
              <span className="text-xl font-bold text-white">TextBook</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Nền tảng mua bán sách giáo khoa hàng đầu dành cho sinh viên. 
              Kết nối người mua và người bán với giá cả hợp lý.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Trang chủ</Link>
              </li>
              <li>
                <Link to="/books" className="hover:text-white transition-colors">Sách</Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white transition-colors">Danh mục</Link>
              </li>
              <li>
                <Link to="/universities" className="hover:text-white transition-colors">Trường học</Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-white transition-colors">Tìm kiếm</Link>
              </li>
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h3 className="text-white font-semibold mb-4">Người bán</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/listings/create" className="hover:text-white transition-colors">Đăng bán sách</Link>
              </li>
              <li>
                <Link to="/my-listings" className="hover:text-white transition-colors">Quản lý tin đăng</Link>
              </li>
              <li>
                <Link to="/seller-guide" className="hover:text-white transition-colors">Hướng dẫn bán hàng</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="hover:text-white transition-colors">Trung tâm trợ giúp</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Liên hệ</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">Câu hỏi thường gặp</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">Điều khoản sử dụng</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">Chính sách bảo mật</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6 text-sm">
              <span>📧 support@textbook.vn</span>
              <span>📞 1900 1234</span>
            </div>
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} TextBook. Tất cả quyền được bảo lưu.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
