import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import { LoadingSpinner } from '../../components/shared';

// Icons as SVG components
const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ListingIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const OrderIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const MoneyIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const EscrowIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const DisputeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  link?: string;
  badge?: number;
}

function StatCard({ title, value, subtitle, icon, color, link, badge }: StatCardProps) {
  const content = (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? formatNumber(value) : value}
          </p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
      {badge !== undefined && badge > 0 && (
        <div className="mt-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            {badge} pending
          </span>
        </div>
      )}
    </div>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }

  return content;
}

export default function AdminDashboardPage() {
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => adminApi.getDashboardStats(),
  });

  // Fetch chart data
  const { data: revenueData } = useQuery({
    queryKey: ['admin-revenue-by-day'],
    queryFn: () => adminApi.getRevenueByDay(30),
  });

  const { data: ordersData } = useQuery({
    queryKey: ['admin-orders-by-day'],
    queryFn: () => adminApi.getOrdersByDay(30),
  });

  const { data: topCategories } = useQuery({
    queryKey: ['admin-top-categories'],
    queryFn: () => adminApi.getTopCategories(5),
  });

  if (statsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Tổng quan hệ thống</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tổng Users"
          value={stats?.users.total || 0}
          subtitle={`${stats?.users.sellers || 0} sellers • ${stats?.users.buyers || 0} buyers`}
          icon={<UsersIcon />}
          color="bg-blue-100 text-blue-600"
          link="/admin/users"
        />
        <StatCard
          title="Tổng Listings"
          value={stats?.listings.total || 0}
          icon={<ListingIcon />}
          color="bg-purple-100 text-purple-600"
          link="/admin/listings"
          badge={stats?.listings.pending}
        />
        <StatCard
          title="Tổng Orders"
          value={stats?.orders.total || 0}
          subtitle={`${stats?.orders.processing || 0} đang xử lý`}
          icon={<OrderIcon />}
          color="bg-green-100 text-green-600"
          link="/admin/orders"
        />
        <StatCard
          title="Doanh thu"
          value={formatPrice(stats?.revenue.total || 0)}
          subtitle="MÔ PHỎNG"
          icon={<MoneyIcon />}
          color="bg-yellow-100 text-yellow-600"
          link="/admin/payments"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Tổng Giao dịch"
          value={stats?.transactions.total || 0}
          icon={<MoneyIcon />}
          color="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          title="Escrow Đang giữ"
          value={formatPrice(stats?.escrow.pending || 0)}
          icon={<EscrowIcon />}
          color="bg-cyan-100 text-cyan-600"
          link="/admin/escrows"
        />
        <StatCard
          title="Disputes Chờ xử lý"
          value={stats?.disputes.pending || 0}
          icon={<DisputeIcon />}
          color="bg-red-100 text-red-600"
          link="/admin/disputes"
        />
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quản lý</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Link
            to="/admin/users"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <p className="font-medium text-gray-900">Users</p>
            <p className="text-sm text-gray-500">Quản lý tài khoản</p>
          </Link>
          <Link
            to="/admin/listings"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <p className="font-medium text-gray-900">Listings</p>
            <p className="text-sm text-gray-500">Quản lý tin đăng</p>
          </Link>
          <Link
            to="/admin/orders"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <p className="font-medium text-gray-900">Orders</p>
            <p className="text-sm text-gray-500">Quản lý đơn hàng</p>
          </Link>
          <Link
            to="/admin/reviews"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <p className="font-medium text-gray-900">Reviews</p>
            <p className="text-sm text-gray-500">Kiểm duyệt đánh giá</p>
          </Link>
          <Link
            to="/admin/reports"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <p className="font-medium text-gray-900">Reports</p>
            <p className="text-sm text-gray-500">Xử lý báo cáo</p>
          </Link>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu 30 ngày gần đây</h2>
          <div className="h-64 flex items-end justify-between gap-1">
            {revenueData?.slice(-14).map((item, idx) => {
              const maxAmount = Math.max(...(revenueData?.map(d => d.amount) || [1]));
              const height = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary-500 rounded-t transition-all hover:bg-primary-600"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={formatPrice(item.amount)}
                  />
                  <span className="text-xs text-gray-400 mt-2 rotate-45 origin-left">
                    {item.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Tổng: {formatPrice(revenueData?.reduce((sum, d) => sum + d.amount, 0) || 0)}
          </p>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Đơn hàng 30 ngày gần đây</h2>
          <div className="h-64 flex items-end justify-between gap-1">
            {ordersData?.slice(-14).map((item, idx) => {
              const maxCount = Math.max(...(ordersData?.map(d => d.count) || [1]));
              const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${item.count} đơn`}
                  />
                  <span className="text-xs text-gray-400 mt-2 rotate-45 origin-left">
                    {item.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Tổng: {ordersData?.reduce((sum, d) => sum + d.count, 0) || 0} đơn hàng
          </p>
        </div>
      </div>

      {/* Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h2>
          {topCategories && topCategories.length > 0 ? (
            <div className="space-y-3">
              {topCategories.map((cat, idx) => (
                <div key={cat.categoryId} className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm font-medium flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{cat.categoryName}</span>
                      <span className="text-sm text-gray-500">{cat.count} books</span>
                    </div>
                    <div className="mt-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full"
                        style={{ width: `${(cat.count / (topCategories[0]?.count || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
          )}
        </div>

        {/* Top Courses */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Courses</h2>
          <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
        </div>
      </div>

      {/* Sandbox Warning */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-yellow-800">MÔI TRƯỜNG MÔ PHỎNG - SANDBOX</p>
            <p className="text-sm text-yellow-700">
              Tất cả doanh thu, giao dịch và số dư ví đều là MÔ PHỎNG. KHÔNG có tiền thật.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
