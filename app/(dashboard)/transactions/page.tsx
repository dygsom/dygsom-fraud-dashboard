'use client';

/**
 * Transactions Page
 *
 * View all fraud detection transactions with advanced filtering, search, and sorting
 */

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { dashboardApi } from '@/lib/api';
import { logger } from '@/lib/logger';
import { formatCurrency, formatDateTime, formatRiskScore } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import { RISK_LEVEL_COLORS } from '@/config/constants';
import type { Transaction } from '@/types';
import type { TransactionFilters } from '@/types/dashboard';
import {
  TransactionFiltersComponent,
  TransactionSearch,
  SortableHeader,
  useSorting,
  TransactionDetailModal,
  Pagination,
  usePagination,
} from '@/components/transactions';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const { sortState, handleSort } = useSorting('created_at');
  const { currentPage, pageSize, handlePageChange, handlePageSizeChange, reset: resetPagination } = usePagination(25);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await dashboardApi.getTransactions({ limit: 50 });
        
        // Log API response for debugging
        console.log('Transactions API Response:', {
          data: data,
          hasData: !!data?.data,
          isArray: Array.isArray(data?.data)
        });
        
        // Ensure we always set an array
        let transactionsArray: Transaction[] = [];
        if (data && Array.isArray(data.data)) {
          transactionsArray = data.data;
        } else if (Array.isArray(data)) {
          transactionsArray = data;
        }
        
        console.log('Setting transactions array:', transactionsArray);
        setTransactions(transactionsArray);

        logger.info('Transactions loaded', {
          count: transactionsArray.length,
        });
      } catch (err: any) {
        logger.error('Failed to load transactions', err);
        setError(err?.message || 'Failed to load transactions');
        // Set empty array as fallback
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Apply filters, search, and sorting
  const filteredAndSortedTransactions = useMemo(() => {
    // Early return if transactions is not ready
    if (!transactions || !Array.isArray(transactions)) {
      return [];
    }
    
    // Safe spread since we know it's an array
    let result = [...transactions];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(transaction => 
        transaction.transaction_id.toLowerCase().includes(query) ||
        transaction.customer_id.toLowerCase().includes(query) ||
        transaction.merchant_id.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.risk_level) {
      result = result.filter(transaction => transaction.risk_level === filters.risk_level);
    }

    if (filters.is_fraud !== undefined) {
      result = result.filter(transaction => transaction.is_fraud === filters.is_fraud);
    }

    if (filters.date_from) {
      const fromDate = new Date(filters.date_from);
      result = result.filter(transaction => 
        new Date(transaction.created_at) >= fromDate
      );
    }

    if (filters.date_to) {
      const toDate = new Date(filters.date_to + 'T23:59:59');
      result = result.filter(transaction => 
        new Date(transaction.created_at) <= toDate
      );
    }

    if (filters.min_amount) {
      result = result.filter(transaction => transaction.amount >= filters.min_amount!);
    }

    if (filters.max_amount) {
      result = result.filter(transaction => transaction.amount <= filters.max_amount!);
    }

    // Apply sorting
    if (sortState.field && sortState.direction) {
      result.sort((a, b) => {
        const field = sortState.field as keyof Transaction;
        let aValue = a[field];
        let bValue = b[field];

        // Handle different data types
        if (field === 'created_at' || field === 'processed_at') {
          aValue = new Date(aValue as string).getTime();
          bValue = new Date(bValue as string).getTime();
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        // Handle null values
        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return sortState.direction === 'asc' ? 1 : -1;
        if (bValue === null) return sortState.direction === 'asc' ? -1 : 1;

        if (aValue < bValue) return sortState.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortState.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [transactions, searchQuery, filters, sortState]);

  // Apply pagination
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedTransactions.slice(startIndex, endIndex);
  }, [filteredAndSortedTransactions, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedTransactions.length / pageSize);

  const clearAllFilters = () => {
    setFilters({});
    setSearchQuery('');
    resetPagination();
  };

  const totalFiltersActive = Object.keys(filters).length + (searchQuery ? 1 : 0);

  // Reset pagination when filters change
  useEffect(() => {
    resetPagination();
  }, [searchQuery, filters, resetPagination]);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Advanced fraud detection transactions with filtering and search</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Total: {Array.isArray(transactions) ? transactions.length : 0}</span>
          <span>•</span>
          <span>Filtered: {filteredAndSortedTransactions.length}</span>
          {totalFiltersActive > 0 && (
            <>
              <span>•</span>
              <span className="text-blue-600 font-medium">{totalFiltersActive} filters active</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllFilters}
                className="h-6 px-2 text-xs ml-2"
              >
                Clear All
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <TransactionSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by Transaction ID, Customer ID, or Merchant ID..."
          />
        </CardContent>
      </Card>

      {/* Filters */}
      <TransactionFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={() => setFilters({})}
      />

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transaction History</span>
            <span className="text-sm font-normal text-gray-600">
              {filteredAndSortedTransactions.length} transactions
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAndSortedTransactions.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {totalFiltersActive > 0 
                  ? 'Try adjusting your search terms or filters.'
                  : 'No transactions available.'
                }
              </p>
              {totalFiltersActive > 0 && (
                <div className="mt-6">
                  <Button onClick={clearAllFilters} variant="outline">
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-600">
                    <SortableHeader field="transaction_id" sortState={sortState} onSort={handleSort}>
                      Transaction ID
                    </SortableHeader>
                    <SortableHeader field="amount" sortState={sortState} onSort={handleSort}>
                      Amount
                    </SortableHeader>
                    <SortableHeader field="risk_score" sortState={sortState} onSort={handleSort}>
                      Risk Score
                    </SortableHeader>
                    <SortableHeader field="risk_level" sortState={sortState} onSort={handleSort}>
                      Risk Level
                    </SortableHeader>
                    <SortableHeader field="is_fraud" sortState={sortState} onSort={handleSort}>
                      Fraud Status
                    </SortableHeader>
                    <SortableHeader field="payment_method" sortState={sortState} onSort={handleSort}>
                      Payment Method
                    </SortableHeader>
                    <SortableHeader field="created_at" sortState={sortState} onSort={handleSort}>
                      Date
                    </SortableHeader>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-gray-100 text-sm hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedTransaction(transaction)}
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
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                            Fraudulent
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                            Legitimate
                          </span>
                        )}
                      </td>
                      <td className="py-3 capitalize">
                        {transaction.payment_method.replace('_', ' ')}
                      </td>
                      <td className="py-3 text-gray-500">
                        {formatDateTime(transaction.created_at)}
                      </td>
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTransaction(transaction);
                          }}
                          className="h-7 px-2 text-xs"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredAndSortedTransactions.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredAndSortedTransactions.length}
              itemsPerPage={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </CardContent>
      </Card>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        isOpen={selectedTransaction !== null}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
}
