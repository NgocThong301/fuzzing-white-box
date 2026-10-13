import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/api';
import { LoadingSpinner, ControlledPagination } from '../../components/shared';
import { toast } from 'sonner';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () => adminApi.getUsers({ page, limit: 20, search: search || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      adminApi.deactivateUser(id, reason),
    onSuccess: () => {
      toast.success('User đã bị deactivate');
      setConfirmDelete(null);
      setDeleteReason('');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => {
      toast.error('Có lỗi xảy ra');
    },
  });

  const handleDelete = () => {
    if (confirmDelete && deleteReason) {
      deleteMutation.mutate({ id: confirmDelete, reason: deleteReason });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  const users = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Users</h1>
        <p className="text-gray-500 mt-1">Tổng cộng: {meta?.total || 0} users</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm theo email hoặc tên..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trường</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Listings</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-medium">
                        {user.fullName?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                    user.role === 'MODERATOR' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {user.university?.name || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {user._count?.listings || 0}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {user._count?.orders || 0}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setConfirmDelete(user.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Deactivate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-6">
          <ControlledPagination
            currentPage={page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ⚠️ Xác nhận Deactivate User
            </h3>
            <p className="text-gray-600 mb-4">
              Hành động này sẽ vô hiệu hóa tài khoản user. User sẽ không thể đăng nhập.
            </p>
            <textarea
              placeholder="Lý do deactivate (bắt buộc)..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              rows={3}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setConfirmDelete(null);
                  setDeleteReason('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={!deleteReason || deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Đang xử lý...' : 'Xác nhận Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
