'use client';

/**
 * Transactions Page
 *
 * View all fraud detection transactions
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardApi } from '@/lib/api';
import { logger } from '@/lib/logger';
import { formatCurrency, formatDateTime, formatRiskScore } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import { RISK_LEVEL_COLORS } from '@/config/constants';
import type { Transaction } from '@/types';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await dashboardApi.getTransactions({ limit: 50 });
        setTransactions(data.data);

        logger.info('Transactions loaded', {
          count: data.data.length,
        });
      } catch (err: any) {
        logger.error('Failed to load transactions', err);
        setError(err?.message || 'Failed to load transactions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-600 mt-1">Recent fraud detection transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No transactions found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-600">
                    <th className="pb-3">Transaction ID</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Risk Score</th>
                    <th className="pb-3">Risk Level</th>
                    <th className="pb-3">Fraud</th>
                    <th className="pb-3">Payment Method</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-gray-100 text-sm hover:bg-gray-50"
                    >
                      <td className="py-3 font-mono text-xs">
                        {transaction.transaction_id.slice(0, 12)}...
                      </td>
                      <td className="py-3 font-medium">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </td>
                      <td className="py-3">
                        {formatRiskScore(transaction.risk_score)}
                      </td>
                      <td className="py-3">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                            RISK_LEVEL_COLORS[transaction.risk_level]
                          )}
                        >
                          {transaction.risk_level}
                        </span>
                      </td>
                      <td className="py-3">
                        {transaction.is_fraud ? (
                          <span className="text-red-600 font-medium">Yes</span>
                        ) : (
                          <span className="text-green-600">No</span>
                        )}
                      </td>
                      <td className="py-3 capitalize">
                        {transaction.payment_method}
                      </td>
                      <td className="py-3 text-gray-500">
                        {formatDateTime(transaction.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
