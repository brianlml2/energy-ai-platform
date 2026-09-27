'use client';

import React, { Suspense } from 'react';
import { api } from '@/api/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Meter } from '@/types/api';
import { METER_STATUS, METER_STATUS_CONFIG } from '@/config/meterStatus';
import { Search, MapPin, ArrowRight, Gauge } from 'lucide-react';
import Link from 'next/link';

function MetersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-white rounded animate-pulse" />
          <div className="h-4 w-96 bg-white rounded animate-pulse" />
        </div>
        <div className="h-10 w-80 bg-white rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded p-6 h-48 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function MetersList() {
  const [meters, setMeters] = React.useState<Meter[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadMeters() {
      try {
        setLoading(true);
        const data = await api.getMeters();
        setMeters(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los medidores');
      } finally {
        setLoading(false);
      }
    }
    loadMeters();
  }, []);

  const filteredMeters = meters.filter(
    (m) =>
      m.meter_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <MetersSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6 bg-white border border-slate-200 rounded text-red-600 shadow-xs">
        <h2 className="text-lg font-semibold mb-2">Error al Cargar Medidores</h2>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Medidores Eléctricos</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar ID de medidor, nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border border-slate-200 rounded pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 w-full md:w-80 shadow-2xs"
          />
        </div>
      </div>

      {filteredMeters.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded p-12 text-center text-slate-500 shadow-xs">
          <Gauge className="w-10 h-10 mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No se encontraron medidores</h3>
          <p className="text-xs text-slate-500 mt-1">Ningún medidor eléctrico coincide con su búsqueda o no hay medidores registrados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredMeters.map((meter) => {
            const statusConfig = METER_STATUS_CONFIG[meter.status] || METER_STATUS_CONFIG[METER_STATUS.ACTIVE];
            const buttonLabel = meter.status === METER_STATUS.ACTIVE ? 'Investigar' : 'Validar';
            return (
              <div
                key={meter.id}
                className="bg-white border border-slate-200 shadow-2xs rounded p-6 hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-lg text-slate-900">{meter.meter_id}</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold ${statusConfig.badgeClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
                      {statusConfig.label}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-800 mt-3">{meter.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {meter.location}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Registrado: {new Date(meter.created_at).toLocaleDateString()}</span>
                  <Link
                    href={`/meters/${meter.meter_id}`}
                    className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded text-xs font-semibold transition-all shadow-2xs"
                  >
                    {buttonLabel} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MetersPage() {
  return (
    <AppLayout>
      <Suspense fallback={<MetersSkeleton />}>
        <MetersList />
      </Suspense>
    </AppLayout>
  );
}
