/**
 * PillarSignalsCard Component
 *
 * Displays detailed signals for a specific fraud detection pillar.
 * Shows individual signal indicators with status and explanations.
 *
 * @module components/charts
 * @see {@link ../../types/dashboard.ts} for PillarSignals type
 */

'use client';

import { Shield, UserX, Lock, Brain } from 'lucide-react';
import { SignalIndicator } from './SignalIndicator';
import type { PillarSignals } from '@/types/dashboard';

// ============================================
// TYPES
// ============================================

type PillarType = 'bot_detection' | 'account_takeover' | 'api_security' | 'fraud_ml';

interface PillarSignalsCardProps {
  /**
   * Pillar type
   */
  pillarType: PillarType;

  /**
   * Pillar signals data
   */
  signals?: PillarSignals[PillarType];

  /**
   * Optional CSS classes
   */
  className?: string;
}

// ============================================
// CONSTANTS
// ============================================

const PILLAR_CONFIG = {
  bot_detection: {
    name: 'Bot Detection',
    icon: Shield,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  account_takeover: {
    name: 'Account Takeover',
    icon: UserX,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  api_security: {
    name: 'API Security',
    icon: Lock,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  fraud_ml: {
    name: 'Fraud ML',
    icon: Brain,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
} as const;

// ============================================
// COMPONENT
// ============================================

export function PillarSignalsCard({
  pillarType,
  signals,
  className = '',
}: PillarSignalsCardProps) {
  const config = PILLAR_CONFIG[pillarType];
  const Icon = config.icon;

  // Pillar is disabled (no signals)
  if (!signals) {
    return (
      <div className={`p-4 bg-slate-800/50 rounded-lg border ${config.borderColor} ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Icon className={`w-5 h-5 ${config.color}`} />
          <h4 className="font-semibold text-white">{config.name}</h4>
        </div>
        <div className="mt-2 p-3 bg-slate-700/50 rounded border border-slate-600">
          <p className="text-sm text-slate-400">⚠️ Este pilar está deshabilitado</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-slate-800/50 rounded-lg border ${config.borderColor} ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-5 h-5 ${config.color}`} />
        <h4 className="font-semibold text-white">{config.name}</h4>
      </div>

      {/* Signals */}
      <div className="space-y-2">
        {pillarType === 'bot_detection' && (
          <>
            <SignalIndicator
              label="Dispositivo Conocido"
              value={(signals as NonNullable<PillarSignals['bot_detection']>).deviceKnown}
              trueIsRisky={false}
            />
            <SignalIndicator
              label="IP Score"
              value={(signals as NonNullable<PillarSignals['bot_detection']>).ipScore}
              trueIsRisky={true}
            />
            <SignalIndicator
              label="Tasa Sospechosa"
              value={(signals as NonNullable<PillarSignals['bot_detection']>).rateSuspicious}
              trueIsRisky={true}
            />
            <SignalIndicator
              label="User Agent Válido"
              value={(signals as NonNullable<PillarSignals['bot_detection']>).userAgentValid}
              trueIsRisky={false}
            />
          </>
        )}

        {pillarType === 'account_takeover' && (
          <>
            <SignalIndicator
              label="Credenciales Comprometidas"
              value={(signals as NonNullable<PillarSignals['account_takeover']>).breached}
              trueIsRisky={true}
            />
            <SignalIndicator
              label="Viaje Imposible"
              value={(signals as NonNullable<PillarSignals['account_takeover']>).impossibleTravel}
              trueIsRisky={true}
            />
            <SignalIndicator
              label="Dispositivo Conocido"
              value={(signals as NonNullable<PillarSignals['account_takeover']>).knownDevice}
              trueIsRisky={false}
            />
            <SignalIndicator
              label="Velocidad Sospechosa"
              value={(signals as NonNullable<PillarSignals['account_takeover']>).velocitySuspicious}
              trueIsRisky={true}
            />
          </>
        )}

        {pillarType === 'api_security' && (
          <>
            <SignalIndicator
              label="Ráfaga Detectada"
              value={(signals as NonNullable<PillarSignals['api_security']>).burstDetected}
              trueIsRisky={true}
            />
            <SignalIndicator
              label="Intentos de Inyección"
              value={(signals as NonNullable<PillarSignals['api_security']>).injectionAttempts}
              trueIsRisky={true}
            />
            <SignalIndicator
              label="Problemas de Validación"
              value={(signals as NonNullable<PillarSignals['api_security']>).validationIssues}
              trueIsRisky={true}
            />
          </>
        )}

        {pillarType === 'fraud_ml' && (
          <>
            <SignalIndicator
              label="Anomalía de Monto"
              value={(signals as NonNullable<PillarSignals['fraud_ml']>).amountAnomaly}
              trueIsRisky={true}
            />
            <SignalIndicator
              label="Anomalía de Velocidad"
              value={(signals as NonNullable<PillarSignals['fraud_ml']>).velocityAnomaly}
              trueIsRisky={true}
            />
            <SignalIndicator
              label="Anomalía de Ubicación"
              value={(signals as NonNullable<PillarSignals['fraud_ml']>).locationAnomaly}
              trueIsRisky={true}
            />
          </>
        )}
      </div>
    </div>
  );
}
