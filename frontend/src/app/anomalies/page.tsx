'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/api/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Anomaly } from '@/types/api';
import { AnomalyCard } from '@/components/anomalies/AnomalyCard';
import { SelectSingle } from '@/components/common/SelectSingle';
import { ANOMALY_TYPE_OPTIONS, SEVERITY_FILTER_OPTIONS, ANOMALY_SORT_OPTIONS } from '@/config/options';
import { Filter, AlertTriangle, ArrowUpDown } from 'lucide-react';

function AnomaliesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-white rounded animate-pulse" />
        </div>
        <div className="flex flex-wrap justify-end gap-3 ml-auto">
          <div className="h-10 w-36 bg-white rounded animate-pulse" />
          <div className="h-10 w-36 bg-white rounded animate-pulse" />
          <div className="h-10 w-36 bg-white rounded animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded p-6 h-36 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function AnomaliesList() {
  const searchParams = useSearchParams();
  const initialSeverity = searchParams.get('severity') || 'ALL';

  const [anomalies, setAnomalies] = React.useState<Anomaly[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [typeFilter, setTypeFilter] = React.useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = React.useState<string>(initialSeverity);
  const [sortOrder, setSortOrder] = React.useState<string>('DEFAULT');

  React.useEffect(() => {
    const sev = searchParams.get('severity');
    if (sev) {
      setSeverityFilter(sev);
    }
  }, [searchParams]);

  React.useEffect(() => {
    async function loadAnomalies() {
      try {
        setLoading(true);
        const data = await api.getAnomalies();
        setAnomalies(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar las anomalías');
      } finally {
        setLoading(false);
      }
    }
    loadAnomalies();
  }, []);

  const filtered = anomalies.filter((a) => {
    if (typeFilter !== 'ALL' && a.type !== typeFilter) return false;
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    return true;
  });

  const severityWeight: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };

  const sortedAndFiltered = [...filtered].sort((a, b) => {
    if (sortOrder === 'HIGH_TO_LOW') {
      return (severityWeight[b.severity] || 0) - (severityWeight[a.severity] || 0);
    }
    if (sortOrder === 'LOW_TO_HIGH') {
      return (severityWeight[a.severity] || 0) - (severityWeight[b.severity] || 0);
    }
    return 0;
  });

  if (loading) {
    return <AnomaliesSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6 bg-white border border-slate-200 rounded text-red-600 shadow-xs">
        <h2 className="text-lg font-semibold mb-2">Error al Cargar Anomalías</h2>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Anomalías y Clasificación por IA</h2>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 ml-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <SelectSingle
              options={ANOMALY_TYPE_OPTIONS}
              value={typeFilter}
              onChange={setTypeFilter}
            />
          </div>

          <div className="flex items-center gap-2">
            <SelectSingle
              options={SEVERITY_FILTER_OPTIONS}
              value={severityFilter}
              onChange={setSeverityFilter}
            />
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <SelectSingle
              options={ANOMALY_SORT_OPTIONS}
              value={sortOrder}
              onChange={setSortOrder}
            />
          </div>
        </div>
      </div>

      {sortedAndFiltered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded p-12 text-center text-slate-500 shadow-xs">
          <AlertTriangle className="w-10 h-10 mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No se encontraron anomalías</h3>
          <p className="text-xs text-slate-500 mt-1">Ninguna anomalía coincide con los filtros seleccionados o no hay registros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sortedAndFiltered.map((anom) => (
            <AnomalyCard key={anom.id} anomaly={anom} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AnomaliesPage() {
  return (
    <AppLayout>
      <Suspense fallback={<AnomaliesSkeleton />}>
        <AnomaliesList />
      </Suspense>
    </AppLayout>
  );
}
