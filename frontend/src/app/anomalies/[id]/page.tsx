'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/api/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Anomaly } from '@/types/api';
import { translateSeverity, translateAnomalyType, getSeverityBadgeClass, getAnomalyTypeBadgeClass } from '@/config/translations';
import { ArrowLeft, CheckCircle2, Cpu, Bot } from 'lucide-react';
import Link from 'next/link';

function AnomalyDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-4 w-32 bg-white rounded" />
      <div className="bg-white border border-slate-200 rounded p-8 h-64" />
      <div className="bg-white border border-slate-200 rounded p-8 h-64" />
    </div>
  );
}

function AnomalyDetailContent() {
  const params = useParams();
  const idNum = Number(params.id);

  const [anomaly, setAnomaly] = React.useState<Anomaly | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadAnomaly() {
      try {
        setLoading(true);
        const data = await api.getAnomalyDetail(idNum);
        setAnomaly(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los detalles de la anomalía');
      } finally {
        setLoading(false);
      }
    }
    if (!isNaN(idNum)) {
      loadAnomaly();
    }
  }, [idNum]);

  if (loading) {
    return <AnomalyDetailSkeleton />;
  }

  if (error || !anomaly) {
    return (
      <div className="p-6 bg-white border border-slate-200 rounded text-red-600 shadow-xs">
        <h2 className="text-lg font-semibold mb-2">Error al Cargar Anomalía</h2>
        <p className="text-sm">{error || 'Anomalía no encontrada'}</p>
        <Link href="/anomalies" className="text-xs text-emerald-600 underline mt-3 inline-block">
          &larr; Volver a Anomalías
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/anomalies"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a Anomalías
        </Link>
        <Link
          href={`/meters/${anomaly.meter_id}`}
          className="inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded text-xs font-semibold transition-colors shadow-2xs"
        >
          <Cpu className="w-4 h-4" /> Ver Telemetría del Medidor ({anomaly.meter_id})
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-white border border-slate-200 shadow-2xs rounded p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="font-mono text-lg sm:text-xl font-bold text-slate-900 bg-slate-100 border border-slate-200 px-3 py-1 rounded">
                {anomaly.meter_id}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-semibold ${getAnomalyTypeBadgeClass(anomaly.type)}`}>
                {translateAnomalyType(anomaly.type)}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Investigación de Anomalía #{anomaly.id}</h2>
            <p className="text-xs text-slate-500 font-mono">
              Detectada el: {new Date(anomaly.detected_at).toLocaleString()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-slate-50 px-4 py-3 rounded border border-slate-200 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Severidad:</span>
              <span className={getSeverityBadgeClass(anomaly.severity)}>
                {translateSeverity(anomaly.severity)}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:ml-3">
              <span className="text-xs font-semibold text-slate-700">Confianza:</span>
              <span className="text-xs font-bold text-slate-900 font-mono">
                {(anomaly.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-slate-50 p-4 rounded border border-slate-200">
            <span className="text-xs text-slate-500 block">Consumo Base</span>
            <span className="text-xl font-bold text-slate-900 font-mono">{anomaly.baseline ?? 'N/D'} kWh</span>
          </div>
          <div className="bg-slate-50 p-4 rounded border border-slate-200">
            <span className="text-xs text-slate-500 block">Consumo Actual</span>
            <span className="text-xl font-bold text-slate-900 font-mono">{anomaly.consumption ?? 'N/D'} kWh</span>
          </div>
          <div className="bg-slate-50 p-4 rounded border border-slate-200">
            <span className="text-xs text-slate-500 block">Variación %</span>
            <span className="text-xl font-bold text-red-600 font-mono">
              {anomaly.variation_percent ? `${anomaly.variation_percent >= 0 ? '+' : ''}${anomaly.variation_percent.toFixed(1)}%` : 'N/D'}
            </span>
          </div>
        </div>

        {/* Reason Explanation */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Motivo de la Anomalía</h3>
            <span title="Generado por IA" className="inline-flex items-center cursor-help">
              <Bot className="w-4 h-4 text-slate-400" />
            </span>
          </div>
          <p className="text-sm text-slate-800 bg-slate-50 p-4 rounded border border-slate-200 leading-relaxed">
            {anomaly.reason}
          </p>
        </div>

        {/* Recommended Action */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Acción Operacional Recomendada</h3>
            <span title="Generado por IA" className="inline-flex items-center cursor-help">
              <Bot className="w-4 h-4 text-slate-400" />
            </span>
          </div>
          <div className="text-sm text-slate-900 bg-emerald-50 p-4 rounded border border-emerald-200 font-medium flex items-start justify-between gap-2.5">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>{anomaly.recommended_action}</div>
            </div>
          </div>
        </div>

        {/* Structured Evidence */}
        {anomaly.evidence && anomaly.evidence.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Evidencia Estructurada</h3>
            <ul className="list-disc list-inside text-xs text-slate-700 space-y-1.5 bg-slate-50 p-4 rounded border border-slate-200">
              {anomaly.evidence.map((ev, i) => (
                <li key={i}>{ev}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Known Events */}
        {anomaly.known_events && anomaly.known_events.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Eventos Operacionales Correlacionados</h3>
            <div className="space-y-3">
              {anomaly.known_events.map((ev) => (
                <div key={ev.id} className="bg-slate-50 p-4 rounded border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono text-emerald-600 font-semibold uppercase">{ev.event_type}</span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{ev.description}</p>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(ev.event_timestamp).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnomalyDetailPage() {
  return (
    <AppLayout>
      <Suspense fallback={<AnomalyDetailSkeleton />}>
        <AnomalyDetailContent />
      </Suspense>
    </AppLayout>
  );
}
