'use client';

/**
 * API Keys Page
 *
 * Manage API keys for the organization
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboardApi } from '@/lib/api';
import { logger } from '@/lib/logger';
import { formatRelativeTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import type { ApiKey, CreateApiKeyRequest } from '@/types';

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);

  const fetchApiKeys = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await dashboardApi.getApiKeys();
      setApiKeys(data);

      logger.info('API keys loaded', { count: data.length });
    } catch (err: any) {
      logger.error('Failed to load API keys', err);
      setError(err?.message || 'Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!keyName.trim()) {
      setError('Please enter a key name');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      const request: CreateApiKeyRequest = {
        key_name: keyName,
        expires_in_days: 365,
      };

      const response = await dashboardApi.createApiKey(request);
      setNewKeyValue(response.key_value);
      setKeyName('');
      setShowCreateForm(false);

      logger.info('API key created', { key_id: response.api_key.id });

      // Refresh list
      await fetchApiKeys();
    } catch (err: any) {
      logger.error('Failed to create API key', err);
      setError(err?.message || 'Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await dashboardApi.revokeApiKey(keyId);
      logger.info('API key revoked', { key_id: keyId });

      // Refresh list
      await fetchApiKeys();
    } catch (err: any) {
      logger.error('Failed to revoke API key', err);
      setError(err?.message || 'Failed to revoke API key');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="text-gray-600">Loading API keys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
          <p className="text-gray-600 mt-1">Manage your organization's API keys</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>Create New Key</Button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* New key value (show once) */}
      {newKeyValue && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">API Key Created!</CardTitle>
            <CardDescription>
              Save this key now - you won't be able to see it again
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-white p-3 font-mono text-sm break-all">
              {newKeyValue}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                navigator.clipboard.writeText(newKeyValue);
                setNewKeyValue(null);
              }}
            >
              Copy & Close
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New API Key</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <Label htmlFor="keyName" required>
                  Key Name
                </Label>
                <Input
                  id="keyName"
                  placeholder="Production API Key"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  disabled={isCreating}
                />
              </div>

              <div className="flex space-x-3">
                <Button type="submit" isLoading={isCreating}>
                  Create Key
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* API Keys List */}
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No API keys found. Create one to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-gray-900">{key.key_name}</h3>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          key.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        )}
                      >
                        {key.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 font-mono">{key.key_prefix}...</p>
                    <div className="flex space-x-4 mt-2 text-xs text-gray-500">
                      <span>Created: {formatRelativeTime(key.created_at)}</span>
                      {key.last_used_at && (
                        <span>Last used: {formatRelativeTime(key.last_used_at)}</span>
                      )}
                    </div>
                  </div>

                  {key.status === 'active' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRevokeKey(key.id)}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
