'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Anomaly } from '@/types/api';
import { translateSeverity, translateAnomalyType, getAnomalyTypeBadgeClass, getSeverityBadgeClass } from '@/config/translations';

interface AnomalyCardProps {
  anomaly: Anomaly;
}

export function AnomalyCard({ anomaly }: AnomalyCardProps) {
  return (
    <div className="bg-white border border-slate-200 shadow-xs rounded p-6 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-3 flex-1">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="font-mono font-bold text-base text-slate-900 bg-slate-100 px-3 py-1 rounded">
            {anomaly.meter_id}
          </span>
          <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold ${getAnomalyTypeBadgeClass(anomaly.type)}`}>
            {translateAnomalyType(anomaly.type)}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${getSeverityBadgeClass(anomaly.severity)}`}>
            Severidad: {translateSeverity(anomaly.severity)}
          </span>
          <span className="text-xs font-mono text-slate-500">
            Confianza: {(anomaly.confidence * 100).toFixed(0)}%
          </span>
        </div>

        <p className="text-sm text-slate-800 font-medium">{anomaly.reason}</p>

        {anomaly.recommended_action && (
          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
            <span className="font-semibold text-slate-900">Acción Recomendada:</span> {anomaly.recommended_action}
          </div>
        )}
      </div>

      <div className="flex flex-col items-end justify-between gap-3 shrink-0 ml-auto text-right">
        <span className="text-xs text-slate-400 font-mono">
          Detectado: {new Date(anomaly.detected_at).toLocaleString()}
        </span>
        <Link
          href={`/anomalies/${anomaly.id}`}
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded text-xs font-semibold shadow-2xs transition-colors shrink-0"
        >
          Abrir Investigación <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
