import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

const RISK_LEVEL_COLORS = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
};

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function formatRiskScore(score: number): string {
  return `${(score * 100).toFixed(1)}%`;
}

export function TransactionDetailModal({
  transaction,
  isOpen,
  onClose,
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Transaction Details</h2>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border',
                RISK_LEVEL_COLORS[transaction.risk_level]
              )}
            >
              {transaction.risk_level.toUpperCase()}
            </span>
            {transaction.is_fraud ? (
              <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800 border border-red-200">
                FRAUDULENT
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 border border-green-200">
                LEGITIMATE
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Transaction Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Transaction ID</label>
                <p className="font-mono text-sm bg-gray-50 p-2 rounded border break-all">
                  {transaction.transaction_id}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Amount</label>
                  <p className="text-lg font-semibold">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Payment Method</label>
                  <p className="capitalize">{transaction.payment_method.replace('_', ' ')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Risk Score</label>
                  <p className="text-lg font-semibold">
                    {formatRiskScore(transaction.risk_score)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Fraud Probability</label>
                  <p className="text-lg font-semibold">
                    {formatRiskScore(transaction.fraud_probability)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer & Merchant Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer & Merchant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Customer ID</label>
                <p className="font-mono text-sm bg-gray-50 p-2 rounded border break-all">
                  {transaction.customer_id}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Merchant ID</label>
                <p className="font-mono text-sm bg-gray-50 p-2 rounded border break-all">
                  {transaction.merchant_id}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">API Key ID</label>
                <p className="font-mono text-sm bg-gray-50 p-2 rounded border break-all">
                  {transaction.api_key_id}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Technical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">IP Address</label>
                <p className="font-mono text-sm">
                  {transaction.ip_address || 'Not provided'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Location</label>
                <p className="text-sm">
                  {transaction.location || 'Not provided'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Device Fingerprint</label>
                <p className="font-mono text-xs bg-gray-50 p-2 rounded border break-all">
                  {transaction.device_fingerprint || 'Not provided'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Created At</label>
                <p className="text-sm">{formatDateTime(transaction.created_at)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Processed At</label>
                <p className="text-sm">{formatDateTime(transaction.processed_at)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Processing Time</label>
                <p className="text-sm">
                  {Math.round(
                    (new Date(transaction.processed_at).getTime() - 
                     new Date(transaction.created_at).getTime()) / 1000
                  )} seconds
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}