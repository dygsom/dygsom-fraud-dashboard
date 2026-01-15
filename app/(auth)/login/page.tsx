'use client';

/**
 * Login Page
 *
 * API Key authentication page for DYGSOM Fraud Detection Dashboard
 * Tenants use their API Key to access the dashboard
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { logger } from '@/lib/logger';

export default function LoginPage() {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(apiKey);
      router.push('/');
    } catch (err: unknown) {
      setError('Invalid API Key. Please check and try again.');
      logger.error('Login failed', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">DYGSOM Dashboard</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="dys_prod_abc123..."
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your DYGSOM API Key to access the dashboard
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !apiKey}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Validating...' : 'Login'}
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-4">
          Don&apos;t have an API Key?{' '}
          <a href="mailto:support@dygsom.pe" className="text-blue-600">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
