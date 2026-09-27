'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/api/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Meter, Reading, Anomaly, AIAnalysis, AnalysisStatus } from '@/types/api';
import { METER_STATUS_CONFIG } from '@/config/meterStatus';
import { MapPin, ArrowLeft, Cpu, RefreshCw, Calendar } from 'lucide-react';
import Link from 'next/link';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { AIAnalysisResultModal } from '@/components/modals/AIAnalysisResultModal';
import { AnomaliesTable } from '@/components/common/AnomaliesTable';

function MeterDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-4 w-32 bg-white rounded" />
        <div className="h-9 w-44 bg-white rounded" />
      </div>
      <div className="bg-white border border-slate-200 shadow-2xs rounded p-6 h-36" />
      <div className="bg-white border border-slate-200 shadow-2xs rounded p-6 h-80" />
      <div className="bg-white border border-slate-200 shadow-2xs rounded p-6 h-64" />
    </div>
  );
}

type PeriodType = '24h' | '7d' | '14d';

function MeterDetailContent() {
  const params = useParams();
  const meterId = decodeURIComponent(params.id as string);

  const [meter, setMeter] = React.useState<Meter | null>(null);
  const [readings, setReadings] = React.useState<Reading[]>([]);
  const [anomalies, setAnomalies] = React.useState<Anomaly[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [period, setPeriod] = React.useState<PeriodType>('14d');

  // AI Analysis state (reusing modal & polling logic)
  const [analysisLoading, setAnalysisLoading] = React.useState(false);
  const [pollingStatus, setPollingStatus] = React.useState<AnalysisStatus | 'IDLE'>('IDLE');
  const [analysis, setAnalysis] = React.useState<AIAnalysis | null>(null);
  const [showModal, setShowModal] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [meterData, readingsData, allAnomalies] = await Promise.all([
          api.getMeterDetail(meterId),
          api.getMeterReadings(meterId),
          api.getAnomalies().catch(() => []),
        ]);
        setMeter(meterData);
        setReadings(readingsData);
        setAnomalies(allAnomalies.filter((a) => a.meter_id === meterId));
      } catch (err: any) {
        setError(err.message || 'Error al cargar los detalles del medidor');
      } finally {
        setLoading(false);
      }
    }
    if (meterId) {
      loadData();
    }
  }, [meterId]);

  const handleRunAnalysis = async () => {
    try {
      setAnalysisLoading(true);
      setAnalysis(null);
      setShowModal(false);
      setPollingStatus('PENDING');

      const res = await api.triggerAIAnalyze(meterId);
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
    } catch {
      setPollingStatus('FAILED');
      setShowModal(true);
    } finally {
      setAnalysisLoading(false);
    }
  };

  if (loading) {
    return <MeterDetailSkeleton />;
  }

  if (error || !meter) {
    return (
      <div className="p-6 bg-white border border-slate-200 rounded text-red-600 shadow-xs">
        <h2 className="text-lg font-semibold mb-2">Error al Cargar Medidor</h2>
        <p className="text-sm">{error || 'Medidor no encontrado'}</p>
        <Link href="/meters" className="text-xs text-emerald-600 underline mt-3 inline-block">
          &larr; Volver a la Flota de Medidores
        </Link>
      </div>
    );
  }

  // Filter readings by selected period based on max timestamp
  const timestamps = readings.map((r) => new Date(r.timestamp).getTime()).filter((t) => !isNaN(t));
  const maxTimestamp = timestamps.length > 0 ? Math.max(...timestamps) : Date.now();
  const hoursMultiplier = period === '24h' ? 24 : period === '7d' ? 7 * 24 : 14 * 24;
  const cutoffTime = maxTimestamp - hoursMultiplier * 60 * 60 * 1000;

  const filteredReadings = readings
    .filter((r) => {
      const t = new Date(r.timestamp).getTime();
      return t >= cutoffTime && t <= maxTimestamp;
    })
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Block 2: Consumo calculation & baseline
  const totalConsumption = filteredReadings.reduce((sum, r) => sum + r.consumption_kwh, 0);
  const baseline = filteredReadings.length > 0 ? totalConsumption / filteredReadings.length : 0;
  const latestReading = filteredReadings[filteredReadings.length - 1] || readings[readings.length - 1];
  const variationPercent = baseline > 0 && latestReading ? ((latestReading.consumption_kwh - baseline) / baseline) * 100 : 0;

  const consumptionChartData = filteredReadings.map((r) => {
    const dateObj = new Date(r.timestamp);
    const label = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
      : r.timestamp;

    return {
      time: label,
      actual: Number(r.consumption_kwh.toFixed(2)),
      baseline: Number(baseline.toFixed(2)),
      voltage: Number(r.voltage_v.toFixed(1)),
      current: Number(r.current_a.toFixed(1)),
      powerFactor: Number(r.power_factor.toFixed(2)),
    };
  });

  // Block 5: Events from anomalies known_events
  const knownEvents = anomalies.flatMap((a) => a.known_events || []).filter((e, idx, self) => idx === self.findIndex((t) => t.description === e.description));

  const statusConfig = METER_STATUS_CONFIG[meter.status] || METER_STATUS_CONFIG.ACTIVE;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <Link
          href="/meters"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a Medidores
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3 ml-auto">
          {/* Period Selector */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded p-1 shadow-2xs text-xs font-semibold">
            <span className="px-2 text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Periodo:
            </span>
            {(['24h', '7d', '14d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded transition-colors uppercase ${
                  period === p ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={analysisLoading}
            className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-4 py-2 rounded text-xs font-semibold transition-all shadow-xs cursor-pointer shrink-0"
          >
            {analysisLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                {pollingStatus === 'PENDING' ? 'Iniciando análisis...' : 'Procesando IA y detectando anomalías...'}
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5" /> Ejecutar Investigación IA
              </>
            )}
          </button>
        </div>
      </div>

      {/* BLOCK 1: Identidad / Status */}
      <div className="bg-white border border-slate-200 shadow-2xs rounded p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xl font-bold text-slate-900 bg-slate-100 border border-slate-200 px-3 py-1 rounded">
              {meter.meter_id}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold ${statusConfig.badgeClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
              {statusConfig.label}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-3">{meter.name}</h2>
          <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
            <MapPin className="w-4 h-4 text-slate-400" /> {meter.location}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded border border-slate-200">
          <div>
            <span className="text-xs text-slate-500 block">Última Lectura kWh</span>
            <span className="text-lg font-bold text-slate-900 font-mono">
              {latestReading?.consumption_kwh.toFixed(2) ?? 'N/D'}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Último Timestamp</span>
            <span className="text-xs font-semibold text-slate-800 font-mono mt-1 block">
              {latestReading?.timestamp ? new Date(latestReading.timestamp).toLocaleString() : 'N/D'}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Total Registros</span>
            <span className="text-lg font-bold text-slate-900 font-mono">{filteredReadings.length}</span>
          </div>
        </div>
      </div>

      {/* BLOCK 2: Consumo (Actual vs Baseline Chart) */}
      <div className="bg-white border border-slate-200 shadow-2xs rounded p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Consumo (Actual vs Línea Base)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Comportamiento del medidor para el período seleccionado ({period})</p>
          </div>
          <div className="flex items-center gap-6 bg-slate-50 px-4 py-2 rounded border border-slate-200">
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">Consumo Período</span>
              <span className="text-sm font-bold text-slate-900 font-mono">{totalConsumption.toFixed(1)} kWh</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">Línea Base</span>
              <span className="text-sm font-bold text-slate-900 font-mono">{baseline.toFixed(1)} kWh</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">Variación %</span>
              <span className={`text-sm font-bold font-mono ${variationPercent >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {variationPercent >= 0 ? '+' : ''}{variationPercent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={consumptionChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} angle={-15} textAnchor="end" height={45} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                formatter={(value: any) => [`${value} kWh`]}
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.5rem', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Line type="monotone" dataKey="actual" name="Consumo Actual" stroke="#0284c7" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="baseline" name="Línea Base" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BLOCK 3: Electrical Measurements (Voltage, Current, Power Factor) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 shadow-2xs rounded p-6">
          <h4 className="text-sm font-bold text-slate-900 mb-1">Voltaje (V)</h4>
          <p className="text-xs text-slate-500 mb-4">Mediciones de tensión eléctrica</p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={consumptionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={9} hide />
                <YAxis stroke="#64748b" fontSize={10} domain={['auto', 'auto']} />
                <Tooltip formatter={(v: any) => [`${v} V`, 'Voltaje']} />
                <Line type="monotone" dataKey="voltage" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-2xs rounded p-6">
          <h4 className="text-sm font-bold text-slate-900 mb-1">Corriente (A)</h4>
          <p className="text-xs text-slate-500 mb-4">Mediciones de corriente eléctrica</p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={consumptionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={9} hide />
                <YAxis stroke="#64748b" fontSize={10} domain={['auto', 'auto']} />
                <Tooltip formatter={(v: any) => [`${v} A`, 'Corriente']} />
                <Line type="monotone" dataKey="current" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-2xs rounded p-6">
          <h4 className="text-sm font-bold text-slate-900 mb-1">Factor de Potencia</h4>
          <p className="text-xs text-slate-500 mb-4">Eficiencia en el consumo de potencia</p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={consumptionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={9} hide />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 1]} />
                <Tooltip formatter={(v: any) => [v, 'Factor de Potencia']} />
                <Line type="monotone" dataKey="powerFactor" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* BLOCK 4: Anomalies */}
      <AnomaliesTable
        anomalies={anomalies}
        title="Anomalías Asociadas al Medidor"
        subtitle={`Incidentes de telemetría detectados para ${meterId}`}
        showVerTodas={false}
        showMeterId={false}
      />

      {/* BLOCK 5: Events */}
      <div className="bg-white border border-slate-200 shadow-2xs rounded p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Eventos Operacionales Relacionados</h3>
          <p className="text-xs text-slate-500 mt-0.5">Cambios operativos y eventos programados que explican desviaciones de consumo</p>
        </div>

        {knownEvents.length === 0 ? (
          <div className="p-4 bg-slate-50 rounded text-slate-500 text-xs">
            No hay eventos operacionales registrados para este medidor.
          </div>
        ) : (
          <div className="space-y-3">
            {knownEvents.map((ev, i) => (
              <div key={i} className="bg-slate-50 p-4 rounded border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
        )}
      </div>

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

export default function MeterDetailPage() {
  return (
    <AppLayout>
      <Suspense fallback={<MeterDetailSkeleton />}>
        <MeterDetailContent />
      </Suspense>
    </AppLayout>
  );
}
