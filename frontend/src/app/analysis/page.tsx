'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/api/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Meter, AIAnalysis, AnalysisStatus } from '@/types/api';
import { AIAnalysisResultModal } from '@/components/modals/AIAnalysisResultModal';
import { SelectSingle } from '@/components/common/SelectSingle';
import { Cpu, Play, RefreshCw, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function AnalysisContent() {
  const searchParams = useSearchParams();
  const initialMeterId = searchParams.get('meter_id') || 'M-109';

  const [meters, setMeters] = React.useState<Meter[]>([]);
  const [selectedMeterId, setSelectedMeterId] = React.useState<string>(initialMeterId);
  const [analysis, setAnalysis] = React.useState<AIAnalysis | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [pollingStatus, setPollingStatus] = React.useState<AnalysisStatus | 'IDLE'>('IDLE');
  const [error, setError] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);

  React.useEffect(() => {
    async function loadMeters() {
      try {
        const data = await api.getMeters();
        setMeters(data);
      } catch (err: any) {
        console.error('Error al cargar medidores', err);
      }
    }
    loadMeters();
  }, []);

  const handleRunAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      setAnalysis(null);
      setShowModal(false);
      setPollingStatus('PENDING');

      const res = await api.triggerAIAnalyze(selectedMeterId);
      const analysisId = res.analysis_id;

      let currentStatus: AnalysisStatus = res.status || 'PENDING';
      let analysisData: AIAnalysis | null = null;

      while (currentStatus === 'PENDING' || currentStatus === 'RUNNING') {
        setPollingStatus(currentStatus);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        try {
          analysisData = await api.getAIAnalysis(analysisId);
          if (analysisData && analysisData.status) {
            currentStatus = analysisData.status;
          }
        } catch {
          // Retry on next interval
        }
      }

      setPollingStatus(currentStatus);
      if (analysisData) {
        setAnalysis(analysisData);
      } else {
        const finalData = await api.getAIAnalysis(analysisId);
        setAnalysis(finalData);
      }
      setShowModal(true);
    } catch (err: any) {
      setError(err.message || 'Error al ejecutar el ciclo de análisis de IA');
      setPollingStatus('FAILED');
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Espacio de Trabajo de Análisis e Investigación IA</h2>
        <p className="text-slate-600 text-sm mt-1">Inicie análisis de telemetría determinista, correlación de línea base, verificación de eventos y explicabilidad por IA.</p>
      </div>

      {/* Control Panel */}
      <div className="bg-white border border-slate-200 shadow-2xs rounded p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col gap-2 flex-1 w-full max-w-xl">
          <label className="text-xs font-medium text-slate-700">Seleccionar Medidor Objetivo</label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
            <div className="flex-1">
              <SelectSingle
                options={meters.map((m) => ({
                  label: `${m.meter_id} - ${m.name} (${m.location})`,
                  value: m.meter_id,
                }))}
                value={selectedMeterId}
                onChange={setSelectedMeterId}
                placeholder="Seleccionar medidor..."
                className="w-full"
              />
            </div>
            <Link
              href={`/meters/${selectedMeterId}`}
              className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2.5 rounded text-xs font-semibold transition-colors shadow-2xs shrink-0"
            >
              Ver detalle <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-6 py-3 rounded text-sm font-semibold transition-all shadow-2xs cursor-pointer shrink-0 w-full lg:w-auto"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              {pollingStatus === 'PENDING' ? 'Iniciando análisis...' : pollingStatus === 'RUNNING' ? 'Procesando IA y detectando anomalías...' : 'Analizando...'}
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> Analizar
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-6 bg-white border border-slate-200 rounded text-red-600 shadow-xs">
          <h3 className="font-semibold mb-1">Error de Análisis</h3>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading Progress State */}
      {loading && (
        <div className="bg-white border border-slate-200 shadow-2xs rounded p-12 text-center space-y-4">
          <RefreshCw className="w-10 h-10 mx-auto text-sky-600 animate-spin" />
          <div>
            <h3 className="font-bold text-slate-900 text-base">Ejecutando Ciclo de Análisis IA</h3>
            <p className="text-xs text-slate-500 mt-1">
              {pollingStatus === 'PENDING'
                ? 'Estado: PENDIENTE - Creando registro y cargando lecturas de telemetría...'
                : 'Estado: EJECUTANDO - Calculando línea base, detectando anomalías y generando explicaciones LLM...'}
            </p>
          </div>
        </div>
      )}

      {/* Analysis Results View */}
      {analysis && !loading && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 shadow-2xs rounded p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400">Análisis ID #{analysis.id}</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">Resultados de Investigación del Medidor {analysis.meter_id}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Creado el: {new Date(analysis.created_at).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">Estado del Ciclo:</span>
              <span className="px-3 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-600">
                {analysis.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {!analysis && !loading && (
        <div className="bg-white border border-slate-200 shadow-2xs rounded p-12 text-center text-slate-500">
          <Cpu className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Seleccione un medidor arriba y haga clic en &quot;Analizar&quot; para iniciar un nuevo flujo de trabajo de investigación con IA.
          </p>
        </div>
      )}

      {showModal && (
        <AIAnalysisResultModal
          analysis={analysis}
          status={pollingStatus}
          onClose={() => setShowModal(false)}
          onRetry={handleRunAnalysis}
        />
      )}
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-12 text-center text-slate-500">Cargando espacio de trabajo de análisis...</div>}>
        <AnalysisContent />
      </Suspense>
    </AppLayout>
  );
}
