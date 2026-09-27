'use client';

import React, { Suspense } from 'react';
import { api } from '@/api/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardSummary, Anomaly, Meter } from '@/types/api';
import { METER_STATUS } from '@/config/meterStatus';
import { AlertTriangle, Gauge, Zap, ShieldAlert, Cpu, Clock } from 'lucide-react';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { ConsumptionTrendChart } from '@/components/dashboard/ConsumptionTrendChart';
import { MetersStatusPieChart } from '@/components/dashboard/MetersStatusPieChart';
import { RecentAnomaliesTable } from '@/components/dashboard/RecentAnomaliesTable';

function DashboardContent() {
  const [summary, setSummary] = React.useState<DashboardSummary | null>(null);
  const [anomalies, setAnomalies] = React.useState<Anomaly[]>([]);
  const [meters, setMeters] = React.useState<Meter[]>([]);
  const [selectedTrendMeterId, setSelectedTrendMeterId] = React.useState<string>('M-109');
  const [readingsData, setReadingsData] = React.useState<any[]>([]);
  const [trendDaysCount, setTrendDaysCount] = React.useState<number>(14);
  const [loading, setLoading] = React.useState(true);
  const [loadingChart, setLoadingChart] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const [sumData, anomData, meterData] = await Promise.all([
          api.getDashboardSummary(),
          api.getAnomalies(),
          api.getMeters(),
        ]);
        setSummary(sumData);
        setAnomalies(anomData);
        setMeters(meterData);
        if (meterData.length > 0 && !meterData.some((m) => m.meter_id === 'M-109')) {
          setSelectedTrendMeterId(meterData[0].meter_id);
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar los datos del panel');
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  React.useEffect(() => {
    async function loadMeterTrend() {
      if (!selectedTrendMeterId) return;
      try {
        setLoadingChart(true);
        const mReadings = await api.getMeterReadings(selectedTrendMeterId).catch(() => []);
        if (mReadings.length > 0) {
          mReadings.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

          const firstT = new Date(mReadings[0].timestamp).getTime();
          const lastT = new Date(mReadings[mReadings.length - 1].timestamp).getTime();
          const daysSpan = !isNaN(firstT) && !isNaN(lastT) ? Math.max(1, Math.round((lastT - firstT) / (1000 * 60 * 60 * 24))) : 14;
          setTrendDaysCount(daysSpan);

          const chartData = mReadings.map((r) => {
            const dateObj = new Date(r.timestamp);
            const label = !isNaN(dateObj.getTime())
              ? dateObj.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : r.timestamp;
            return {
              timestamp: label,
              consumo: Number(r.consumption_kwh.toFixed(2)),
            };
          });
          setReadingsData(chartData);
        } else {
          setReadingsData([]);
        }
      } catch {
        setReadingsData([]);
      } finally {
        setLoadingChart(false);
      }
    }
    loadMeterTrend();
  }, [selectedTrendMeterId]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded p-6 h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded h-72" />
          <div className="bg-white border border-slate-200 rounded h-72" />
        </div>
        <div className="bg-white border border-slate-200 rounded h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white border border-slate-200 rounded text-red-600 shadow-xs">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> Error al Cargar el Panel
        </h2>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const activeMetersCount = meters.filter((m) => m.status === METER_STATUS.ACTIVE).length;
  const activePercent = meters.length > 0 ? Math.round((activeMetersCount / meters.length) * 100) : 0;
  const highSeverityCount = anomalies.filter((a) => a.severity === 'HIGH').length;

  const consumptionChange = summary?.consumption_change_percent ?? 0;

  // Calculate average confidence from anomalies list
  const avgConfidence = anomalies.length > 0
    ? Math.round((anomalies.reduce((acc, a) => acc + (a.confidence || 0), 0) / anomalies.length) * 100)
    : 95;

  const statusCounts = meters.reduce(
    (acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    },
    { [METER_STATUS.ACTIVE]: 0, [METER_STATUS.INACTIVE]: 0, [METER_STATUS.MAINTENANCE]: 0 } as Record<string, number>
  );

  const pieData = [
    { name: 'Activos', value: statusCounts[METER_STATUS.ACTIVE], color: '#10b981' },
    { name: 'Inactivos', value: statusCounts[METER_STATUS.INACTIVE], color: '#94a3b8' },
    { name: 'Mantenimiento', value: statusCounts[METER_STATUS.MAINTENANCE], color: '#f59e0b' },
  ].filter((item) => item.value > 0);

  const totalMetersCount = summary?.total_meters ?? meters.length;
  const meterOptions = meters.map((m) => ({ label: `${m.meter_id} - ${m.name}`, value: m.meter_id }));

  return (
    <div className="space-y-8">
      {/* 2 ROWS: 3 Columns each (6 Summary Cards using DashboardCard) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <DashboardCard
          title="Medidores"
          value={totalMetersCount}
          icon={Gauge}
          badgeText={`${activePercent}% activos`}
          badgeClass="bg-emerald-100 text-emerald-600"
          iconBgClass="bg-slate-100 text-slate-700 group-hover:bg-slate-200"
          href="/meters"
        />

        <DashboardCard
          title={`Consumo Total (${trendDaysCount}d)`}
          value={summary?.total_consumption_kwh ? summary.total_consumption_kwh.toLocaleString() : '0'}
          unit="kWh"
          icon={Zap}
          badgeText={`últimos ${trendDaysCount} días`}
          badgeClass="bg-emerald-100 text-emerald-600"
          iconBgClass="bg-emerald-50 text-emerald-600"
        />

        <DashboardCard
          title="Anomalías IA"
          value={summary?.active_anomalies ?? anomalies.length}
          icon={AlertTriangle}
          badgeText={`${anomalies.length} detectadas`}
          badgeClass="bg-amber-100 text-amber-600"
          iconBgClass="bg-amber-50 text-amber-600 group-hover:bg-amber-100"
          href="/anomalies"
        />

        <DashboardCard
          title="Alta Prioridad"
          value={summary?.high_severity ?? highSeverityCount}
          icon={ShieldAlert}
          badgeText="Requieren atención"
          badgeClass="bg-red-100 text-red-600"
          iconBgClass="bg-red-50 text-red-600 group-hover:bg-red-100"
          href="/anomalies?severity=HIGH"
        />

        <DashboardCard
          title="Confianza IA"
          value={`${avgConfidence}%`}
          icon={Cpu}
          badgeText="Alta precisión"
          badgeClass="bg-sky-100 text-sky-600"
          iconBgClass="bg-sky-50 text-sky-600"
        />

        <DashboardCard
          title="Último Análisis"
          value={summary?.last_analysis_at ? new Date(summary.last_analysis_at).toLocaleDateString() : 'N/D'}
          icon={Clock}
          badgeText="Completado"
          badgeClass="bg-emerald-100 text-emerald-600"
          iconBgClass="bg-slate-100 text-slate-700"
        />
      </div>

      {/* SECOND ROW: 2 Cards (Line Graphic & Circular Graphic) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ConsumptionTrendChart
          readingsData={readingsData}
          loadingChart={loadingChart}
          selectedTrendMeterId={selectedTrendMeterId}
          onSelectMeter={setSelectedTrendMeterId}
          meterOptions={meterOptions}
          trendDaysCount={trendDaysCount}
        />

        <MetersStatusPieChart
          pieData={pieData}
          totalMetersCount={totalMetersCount}
        />
      </div>

      {/* THIRD ROW: Last Anomalies Table Component */}
      <RecentAnomaliesTable anomalies={anomalies} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AppLayout>
      <Suspense fallback={null}>
        <DashboardContent />
      </Suspense>
    </AppLayout>
  );
}
