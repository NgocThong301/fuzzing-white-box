import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { walletApi } from '../../lib/api';
import {
  ESCROW_STATUS_LABELS,
  ESCROW_STATUS_COLORS,
  TRANSACTION_TYPE_LABELS,
} from '../../types';
import type { EscrowTransaction, WalletTransaction } from '../../types';
import { ControlledPagination, LoadingSpinner } from '../../components/shared';

export default function WalletPage() {
  const [txPage, setTxPage] = useState(1);

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletApi.getWallet(),
  });

  const { data: transactionsData, isLoading: txLoading } = useQuery({
    queryKey: ['wallet-transactions', txPage],
    queryFn: () => walletApi.getTransactions({ page: txPage, limit: 10 }),
  });

  const { data: escrows, isLoading: escrowLoading } = useQuery({
    queryKey: ['wallet-escrows'],
    queryFn: () => walletApi.getEscrows(),
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (walletLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  const transactions = transactionsData?.data || [];
  const txMeta = transactionsData?.meta;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Sandbox Warning Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-yellow-800">MÔI TRƯỜNG MÔ PHỎNG - SANDBOX</p>
            <p className="text-sm text-yellow-700">
              Đây là ví mô phỏng dành cho mục đích học tập. KHÔNG có tiền thật trong ví này.
            </p>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Ví của tôi</h1>

      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white mb-8">
        <p className="text-primary-100 text-sm mb-1">Số dư khả dụng</p>
        <p className="text-4xl font-bold mb-4">
          {formatPrice(wallet?.availableBalance || 0)}
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-primary-200">Tổng số dư</p>
            <p className="text-xl font-semibold">{formatPrice(wallet?.balance || 0)}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-primary-200">Đang chờ giải ngân</p>
            <p className="text-xl font-semibold">{formatPrice(wallet?.pendingEscrow || 0)}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Transaction History */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử giao dịch</h2>

          {txLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : transactions.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
              Chưa có giao dịch nào
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
              {transactions.map((tx: WalletTransaction) => (
                <div key={tx.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {TRANSACTION_TYPE_LABELS[tx.type as keyof typeof TRANSACTION_TYPE_LABELS] || tx.type}
                    </p>
                    <p className="text-sm text-gray-500">{formatDate(tx.createdAt)}</p>
                    {tx.description && (
                      <p className="text-xs text-gray-400 mt-1">{tx.description}</p>
                    )}
                  </div>
                  <div className={`font-semibold ${tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? 'text-green-600' : 'text-gray-900'}`}>
                    {tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? '+' : ''}{formatPrice(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {txMeta && txMeta.totalPages > 1 && (
            <div className="mt-4">
              <ControlledPagination
                currentPage={txPage}
                totalPages={txMeta.totalPages}
                onPageChange={setTxPage}
              />
            </div>
          )}
        </div>

        {/* Escrow Transactions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Escrow đang xử lý</h2>

          {escrowLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : !escrows || escrows.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
              Không có escrow nào đang xử lý
            </div>
          ) : (
            <div className="space-y-4">
              {escrows.map((escrow: EscrowTransaction) => (
                <div key={escrow.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${ESCROW_STATUS_COLORS[escrow.status]}`}>
                      {ESCROW_STATUS_LABELS[escrow.status]}
                    </span>
                    <span className="font-semibold text-primary-600">
                      {formatPrice(escrow.amount)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Order #{escrow.orderId}
                  </p>
                  <div className="text-xs text-gray-500">
                    <p>Người mua: {escrow.order?.buyer?.fullName || 'N/A'}</p>
                    <p>Tạo lúc: {formatDate(escrow.createdAt)}</p>
                  </div>
                  {escrow.status === 'HELD' && (
                    <button className="mt-3 w-full text-sm text-red-600 hover:text-red-700 font-medium">
                      Khiếu nại
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
