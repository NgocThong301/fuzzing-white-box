import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '@/lib/api';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Get cart count from CartContext
  const cartItemCount = cart?.items?.length || 0;

  // Fetch unread notification count
  const { data: unreadData } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => notificationApi.getUnreadCount(),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  const unreadCount = unreadData?.count || 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotificationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-primary-600 text-white text-sm">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <span>📚 Sách giáo khoa - Giá sinh viên</span>
          <div className="flex gap-4 items-center">
            {isAuthenticated ? (
              <Link to="/notifications" className="flex items-center gap-2 hover:text-primary-200">
                <span className="relative">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </span>
              </Link>
            ) : (
              <>
                <Link to="/login" className="hover:text-primary-200">Đăng nhập</Link>
                <Link to="/register" className="hover:text-primary-200">Đăng ký</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">📚</span>
            <span className="text-xl font-bold text-primary-600 hidden sm:block">TextBook</span>
          </Link>

          {/* Search bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Tìm kiếm sách, tác giả, ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-4 text-gray-500 hover:text-primary-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Cart Icon */}
            <button
              onClick={() => navigate('/cart')}
              className="relative p-2 text-gray-600 hover:text-primary-600"
              title="Giỏ hàng"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </button>

            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                  className="relative p-2 text-gray-600 hover:text-primary-600"
                  title="Thông báo"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotificationDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Thông báo</h3>
                        <Link
                          to="/notifications"
                          onClick={() => setShowNotificationDropdown(false)}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          Xem tất cả
                        </Link>
                      </div>
                      {unreadCount > 0 && (
                        <p className="text-sm text-gray-500 mt-1">{unreadCount} thông báo chưa đọc</p>
                      )}
                    </div>
                    <div className="p-2">
                      <Link
                        to="/notifications"
                        onClick={() => setShowNotificationDropdown(false)}
                        className="block px-4 py-2 text-center text-sm text-primary-600 hover:bg-gray-50 rounded-lg"
                      >
                        Xem tất cả thông báo của bạn
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Menu */}
            {isAuthenticated && (
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 text-gray-600 hover:text-primary-600">
                  <span className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <div className="p-2">
                    <div className="px-4 py-2 border-b">
                      <p className="font-medium text-gray-900">{user?.fullName}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    {user?.roles?.some((r: any) => r.name === 'ADMIN') && (
                      <>
                        <Link to="/admin" className="block px-4 py-2 text-purple-700 hover:bg-purple-50 rounded-lg font-medium">⚙️ Trang Admin</Link>
                      </>
                    )}
                    <Link to="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Đơn hàng của tôi</Link>
                    <Link to="/favorites" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Yêu thích</Link>
                    <Link to="/wallet" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Ví của tôi</Link>
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">Đăng xuất</button>
                  </div>
                </div>
              </div>
            )}

            <Link
              to="/listings/create"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Đăng bán</span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-600 hover:text-primary-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="mt-4 md:hidden">
          <input
            type="text"
            placeholder="Tìm kiếm sách..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </form>
      </div>

      {/* Navigation */}
      <nav className="border-t border-gray-100 hidden md:block">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-1 py-2 overflow-x-auto">
            <li>
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/') ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Trang chủ
              </Link>
            </li>
            <li>
              <Link
                to="/books"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/books') ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Sách
              </Link>
            </li>
            <li>
              <Link
                to="/categories"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/categories') ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Danh mục
              </Link>
            </li>
            <li>
              <Link
                to="/universities"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/universities') ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Trường học
              </Link>
            </li>
            <li>
              <Link
                to="/search"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/search') ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Tìm kiếm nâng cao
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4">
          <div className="container mx-auto px-4 space-y-2">
            <Link
              to="/"
              onClick={() => setShowMobileMenu(false)}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              Trang chủ
            </Link>
            <Link
              to="/books"
              onClick={() => setShowMobileMenu(false)}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              Sách
            </Link>
            <Link
              to="/categories"
              onClick={() => setShowMobileMenu(false)}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              Danh mục
            </Link>
            <Link
              to="/universities"
              onClick={() => setShowMobileMenu(false)}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              Trường học
            </Link>
            <Link
              to="/search"
              onClick={() => setShowMobileMenu(false)}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              Tìm kiếm nâng cao
            </Link>
            
            {/* Authenticated user menu */}
            {isAuthenticated && (
              <>
                <div className="border-t border-gray-200 my-2 pt-2">
                  <p className="px-4 py-2 text-xs text-gray-500 uppercase font-semibold">Tài khoản</p>
                  {user?.roles?.some((r: any) => r.name === 'ADMIN') && (
                    <>
                      <Link to="/admin" onClick={() => setShowMobileMenu(false)} className="block px-4 py-2 text-purple-700 hover:bg-purple-50 rounded-lg font-medium">⚙️ Trang Admin</Link>
                    </>
                  )}
                  <Link
                    to="/orders"
                    onClick={() => setShowMobileMenu(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    📦 Đơn hàng của tôi
                  </Link>
                  <Link
                    to="/favorites"
                    onClick={() => setShowMobileMenu(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    ❤️ Yêu thích
                  </Link>
                  <Link
                    to="/notifications"
                    onClick={() => setShowMobileMenu(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    🔔 Thông báo {unreadCount > 0 && `(${unreadCount})`}
                  </Link>
                  <Link
                    to="/wallet"
                    onClick={() => setShowMobileMenu(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    💰 Ví của tôi
                  </Link>
                </div>
                <button
                  onClick={() => { logout(); setShowMobileMenu(false); }}
                  className="w-full text-left block px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Đăng xuất
                </button>
              </>
            )}
            
            <Link
              to="/listings/create"
              onClick={() => setShowMobileMenu(false)}
              className="block px-4 py-3 text-center bg-primary-600 text-white rounded-lg"
            >
              Đăng bán sách
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
