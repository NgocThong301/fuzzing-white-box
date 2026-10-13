import { Link, useLocation } from 'react-router-dom';

const adminNavItems = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/users', label: 'Users', icon: '👥' },
  { path: '/admin/listings', label: 'Quản lý sách', icon: '📚' },
  { path: '/admin/orders', label: 'Orders', icon: '🛒' },
  { path: '/admin/payments', label: 'Payments', icon: '💳' },
  { path: '/admin/escrows', label: 'Escrows', icon: '🔒' },
  { path: '/admin/disputes', label: 'Disputes', icon: '⚠️' },
  { path: '/admin/reviews', label: 'Reviews', icon: '⭐' },
  { path: '/admin/reports', label: 'Reports', icon: '🚩' },
  { path: '/admin/coupons', label: 'Coupons', icon: '🎟️' },
];

export default function AdminLayout({ children }: { children?: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <span className="font-bold text-gray-900">Admin Panel</span>
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          {adminNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
