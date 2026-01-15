/**
 * Settings Page - Pillar Configuration
 *
 * Allow tenant to enable/disable pillars and configure thresholds.
 * Implements Fase 5 specifications from PASOS_DESARROLLO_DASHBOARD.md
 *
 * @module app/(dashboard)/settings
 */

'use client';

import { useState, useEffect } from 'react';
import { Save, RotateCcw, Settings2, Shield, Lock, Bot, Brain } from 'lucide-react';
import { api } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToggleSwitch } from '@/components/ui/toggle-switch';
import { Slider } from '@/components/ui/slider';
import { ActionType } from '@/types/dashboard';
import type { TenantConfig } from '@/types/dashboard';

// Default configuration
const DEFAULT_CONFIG: TenantConfig = {
  pillars: {
    bot_detection: true,
    account_takeover: true,
    api_security: true,
    fraud_ml: true,
  },
  thresholds: {
    bot_score: 0.7,
    ato_score: 0.8,
    api_score: 0.75,
    ml_score: 0.65,
  },
  actions: {
    high_risk_action: ActionType.Block,
    medium_risk_action: ActionType.Challenge,
    low_risk_action: ActionType.Allow,
  },
};

export default function SettingsPage() {
  const [config, setConfig] = useState<TenantConfig>(DEFAULT_CONFIG);
  const [originalConfig, setOriginalConfig] = useState<TenantConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load configuration from API
  useEffect(() => {
    loadConfig();
  }, []);

  // Track changes
  useEffect(() => {
    const changed = JSON.stringify(config) !== JSON.stringify(originalConfig);
    setHasChanges(changed);
  }, [config, originalConfig]);

  const loadConfig = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.tenant.getConfig();
      const loadedConfig = response.config;
      setConfig(loadedConfig);
      setOriginalConfig(loadedConfig);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load config:', err);
      }
      setError('Failed to load configuration. Using defaults.');
      // Use defaults on error
      setConfig(DEFAULT_CONFIG);
      setOriginalConfig(DEFAULT_CONFIG);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePillar = (pillar: keyof typeof config.pillars, enabled: boolean) => {
    setConfig({
      ...config,
      pillars: {
        ...config.pillars,
        [pillar]: enabled,
      },
    });
  };

  const handleThresholdChange = (pillar: string, value: number) => {
    setConfig({
      ...config,
      thresholds: {
        ...config.thresholds,
        [`${pillar}_score`]: value / 100, // Convert to 0-1
      },
    });
  };

  const handleActionChange = (key: keyof typeof config.actions, value: ActionType) => {
    setConfig({
      ...config,
      actions: {
        ...config.actions,
        [key]: value,
      },
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const result = await api.tenant.updateConfig(config);
      setOriginalConfig(result.config);
      setConfig(result.config);
      alert('✅ Configuration saved successfully!');
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to save config:', err);
      }
      setError('Failed to save configuration. Please try again.');
      alert('❌ Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(originalConfig);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Settings2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />
          <p className="mt-4 text-slate-400">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-sm text-slate-400">
            Configure fraud detection pillars and thresholds
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleReset}
            disabled={!hasChanges || isSaving}
            variant="outline"
            className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="mb-6 border-red-900 bg-red-950/20">
          <CardContent className="pt-6">
            <p className="text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <div className="mb-6 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
          <p className="text-sm text-yellow-400">
            ⚠️ You have unsaved changes. Click "Save Changes" to apply your configuration.
          </p>
        </div>
      )}

      {/* Pillar Configuration */}
      <Card className="mb-6 border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle className="text-white">Fraud Detection Pillars</CardTitle>
          <CardDescription className="text-slate-400">
            Enable or disable fraud detection pillars. Disabled pillars will not be executed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <PillarConfigCard
            name="Bot Detection"
            description="Detects automated bots, VPNs, proxies, and suspicious user agents"
            icon={<Bot className="h-6 w-6" />}
            enabled={config.pillars.bot_detection}
            threshold={Math.round((config.thresholds.bot_score || 0.7) * 100)}
            onToggle={(enabled) => handleTogglePillar('bot_detection', enabled)}
            onThresholdChange={(value) => handleThresholdChange('bot', value)}
            features={[
              'IP Reputation (IPQualityScore + AbuseIPDB)',
              'Device Fingerprinting',
              'User-Agent Analysis',
              'Rate Limiting Detection',
            ]}
          />

          <PillarConfigCard
            name="Account Takeover"
            description="Detects credential breaches, impossible travel, and velocity attacks"
            icon={<Lock className="h-6 w-6" />}
            enabled={config.pillars.account_takeover}
            threshold={Math.round((config.thresholds.ato_score || 0.8) * 100)}
            onToggle={(enabled) => handleTogglePillar('account_takeover', enabled)}
            onThresholdChange={(value) => handleThresholdChange('ato', value)}
            features={[
              'HIBP Credential Breach Check',
              'GeoIP + Impossible Travel (Haversine)',
              'Login Velocity Checks',
              'Device Change Detection',
            ]}
          />

          <PillarConfigCard
            name="API Security"
            description="Detects SQL injection, XSS attacks, and malicious payloads"
            icon={<Shield className="h-6 w-6" />}
            enabled={config.pillars.api_security}
            threshold={Math.round((config.thresholds.api_score || 0.75) * 100)}
            onToggle={(enabled) => handleTogglePillar('api_security', enabled)}
            onThresholdChange={(value) => handleThresholdChange('api', value)}
            features={[
              'SQL Injection Detection',
              'XSS Attack Detection',
              'Payload Size Analysis',
              'Rate Pattern Detection',
            ]}
          />

          <PillarConfigCard
            name="Fraud ML"
            description="Machine learning-based fraud prediction with feature engineering"
            icon={<Brain className="h-6 w-6" />}
            enabled={config.pillars.fraud_ml}
            threshold={Math.round((config.thresholds.ml_score || 0.65) * 100)}
            onToggle={(enabled) => handleTogglePillar('fraud_ml', enabled)}
            onThresholdChange={(value) => handleThresholdChange('ml', value)}
            features={[
              '12 Engineered Features',
              'Heuristic Scoring (MVP)',
              'Velocity & Behavioral Analysis',
              'Time-based Risk Factors',
            ]}
          />
        </CardContent>
      </Card>

      {/* Action Configuration */}
      <Card className="border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle className="text-white">Action Configuration</CardTitle>
          <CardDescription className="text-slate-400">
            Configure actions based on risk score thresholds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ActionConfig
            label="High Risk Action"
            description="Action when risk score ≥ 80%"
            value={config.actions.high_risk_action}
            onChange={(value) => handleActionChange('high_risk_action', value)}
          />

          <ActionConfig
            label="Medium Risk Action"
            description="Action when risk score ≥ 60%"
            value={config.actions.medium_risk_action}
            onChange={(value) => handleActionChange('medium_risk_action', value)}
          />

          <ActionConfig
            label="Low Risk Action"
            description="Action when risk score < 60%"
            value={config.actions.low_risk_action}
            onChange={(value) => handleActionChange('low_risk_action', value)}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// PillarConfigCard Component
interface PillarConfigCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  threshold: number;
  onToggle: (enabled: boolean) => void;
  onThresholdChange: (value: number) => void;
  features: string[];
}

function PillarConfigCard({
  name,
  description,
  icon,
  enabled,
  threshold,
  onToggle,
  onThresholdChange,
  features,
}: PillarConfigCardProps) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-4">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">{icon}</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{name}</h3>
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          </div>
        </div>
        <ToggleSwitch checked={enabled} onChange={onToggle} />
      </div>

      {/* Features */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-medium uppercase text-slate-400">Features:</p>
        <ul className="space-y-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-slate-300">
              <span className="text-blue-400">✓</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Threshold Slider */}
      {enabled && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">Risk Threshold</label>
            <span className="text-sm font-semibold text-white">{threshold}%</span>
          </div>
          <Slider
            value={threshold}
            onChange={onThresholdChange}
            min={0}
            max={100}
            step={5}
            disabled={!enabled}
          />
          <p className="mt-2 text-xs text-slate-500">
            Scores above {threshold}% will trigger high-risk actions
          </p>
        </div>
      )}

      {/* Disabled state */}
      {!enabled && (
        <div className="mt-4 rounded border border-slate-600 bg-slate-800/50 p-3">
          <p className="text-sm text-slate-400">
            ⚠️ This pillar is disabled and will not be executed
          </p>
        </div>
      )}
    </div>
  );
}

// ActionConfig Component
interface ActionConfigProps {
  label: string;
  description: string;
  value: ActionType;
  onChange: (value: ActionType) => void;
}

function ActionConfig({ label, description, value, onChange }: ActionConfigProps) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-700/30 p-4">
      <div>
        <p className="font-medium text-white">{label}</p>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ActionType)}
        className="rounded border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value={ActionType.Allow}>Allow</option>
        <option value={ActionType.Friction}>Friction</option>
        <option value={ActionType.Challenge}>Challenge</option>
        <option value={ActionType.Block}>Block</option>
      </select>
    </div>
  );
}
