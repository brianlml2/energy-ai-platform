'use client';

import React from 'react';
import { AIAnalysis } from '@/types/api';
import { translateSeverity, translateAnomalyType, getAnomalyTypeBadgeClass, getSeverityBadgeClass } from '@/config/translations';
import { CheckCircle2, AlertTriangle, X, ArrowRight, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AIAnalysisResultModalProps {
  analysis: AIAnalysis | null;
  status: string;
  onClose: () => void;
  onRetry: () => void;
}

export function AIAnalysisResultModal({ analysis, status, onClose, onRetry }: AIAnalysisResultModalProps) {
  const router = useRouter();

  if (!analysis && status !== 'FAILED') return null;

  const isCompleted = status === 'COMPLETED' && analysis?.result;
  const isFailed = status === 'FAILED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded shadow-xl max-w-lg w-full p-6 space-y-6 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1 rounded"
        >
          <X className="w-5 h-5" />
        </button>

        {isCompleted && (
          <>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Análisis Completado con Éxito</h3>
                <p className="text-xs text-slate-500">Medidor: <span className="font-mono font-bold text-slate-700">{analysis.meter_id}</span></p>
              </div>
            </div>

            <div className="space-y-4 bg-slate-50 p-4 rounded border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Clasificación</span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold ${getAnomalyTypeBadgeClass(analysis.result!.type)}`}>
                  {translateAnomalyType(analysis.result!.type)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Severidad</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${getSeverityBadgeClass(analysis.result!.severity)}`}>
                  {translateSeverity(analysis.result!.severity)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-1">Motivo</span>
                <p className="text-xs text-slate-700 leading-relaxed">{analysis.result!.reason}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-1">Acción Recomendada</span>
                <p className="text-xs font-medium text-slate-900 bg-white p-3 rounded border border-slate-200">{analysis.result!.recommended_action}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  const anomalyId = analysis.result?.id;
                  if (anomalyId) {
                    router.push(`/anomalies/${anomalyId}`);
                  } else {
                    router.push('/anomalies');
                  }
                }}
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                <span>Ir a la anomalía</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}

        {isFailed && (
          <>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-100 text-red-600 rounded">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Análisis Fallido</h3>
                <p className="text-xs text-slate-500">No se pudo completar el ciclo de análisis de IA.</p>
              </div>
            </div>

            <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200 text-xs">
              El motor de análisis o el modelo LLM experimentó un error temporal. Por favor, intente nuevamente.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  onClose();
                  onRetry();
                }}
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reintentar</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
