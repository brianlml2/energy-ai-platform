'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { SelectSingle } from '@/components/common/SelectSingle';

interface Option {
  label: string;
  value: string;
}

interface ConsumptionTrendChartProps {
  readingsData: any[];
  loadingChart: boolean;
  selectedTrendMeterId: string;
  onSelectMeter: (meterId: string) => void;
  meterOptions: Option[];
  trendDaysCount: number;
}

export function ConsumptionTrendChart({
  readingsData,
  loadingChart,
  selectedTrendMeterId,
  onSelectMeter,
  meterOptions,
  trendDaysCount,
}: ConsumptionTrendChartProps) {
  return (
    <div className="lg:col-span-2 bg-white border border-slate-200 shadow-2xs rounded p-6 flex flex-col justify-between">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Consumo Total (Últimos {trendDaysCount} días)</h3>
          <p className="text-xs text-slate-500">Telemetría de consumo para el medidor seleccionado</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2.5 sm:gap-3 ml-auto">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500">Medidor:</label>
            <SelectSingle
              options={meterOptions}
              value={selectedTrendMeterId}
              onChange={onSelectMeter}
            />
          </div>
          <Link
            href={`/meters/${selectedTrendMeterId}`}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors shadow-2xs shrink-0"
          >
            Ver detalle <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="h-72 w-full">
        {loadingChart ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs animate-pulse">
            Cargando telemetría del medidor...
          </div>
        ) : readingsData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs">
            No hay lecturas disponibles para {selectedTrendMeterId}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={readingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                wrapperStyle={{ zIndex: 50 }}
                formatter={(value: any) => [`${value} kWh`, 'Consumo']}
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.5rem', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="consumo" name="Consumo (kWh)" stroke="#0284c7" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
