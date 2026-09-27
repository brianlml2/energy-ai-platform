'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Anomaly } from '@/types/api';
import { translateSeverity, translateAnomalyType, getAnomalyTypeBadgeClass, getSeverityBadgeClass } from '@/config/translations';

interface AnomaliesTableProps {
  anomalies: Anomaly[];
  title?: string;
  subtitle?: string;
  showVerTodas?: boolean;
  showMeterId?: boolean;
}

export function AnomaliesTable({
  anomalies,
  title = 'Últimas Anomalías Detectadas',
  subtitle,
  showVerTodas = true,
  showMeterId = true,
}: AnomaliesTableProps) {
  const sortedAnomalies = [...anomalies].sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime());

  return (
    <div className="bg-white border border-slate-200 shadow-2xs rounded overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {subtitle || `${anomalies.length} anomalías y casos analizados`}
          </p>
        </div>
        {showVerTodas && (
          <Link
            href="/anomalies"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded transition-colors"
          >
            Ver Todas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              {showMeterId && <th className="px-6 py-3.5 w-32">ID de Medidor</th>}
              <th className="px-6 py-3.5 w-64">Tipo</th>
              <th className="px-6 py-3.5 w-28">Severidad</th>
              <th className="px-6 py-3.5 w-24">Confianza</th>
              <th className="px-6 py-3.5 max-w-[200px]">Motivo</th>
              <th className="px-6 py-3.5 w-52">Fecha</th>
              <th className="px-6 py-3.5 text-right w-28">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sortedAnomalies.length === 0 ? (
              <tr>
                <td colSpan={showMeterId ? 7 : 6} className="px-6 py-5 text-center text-slate-400 text-xs italic">
                  No hay anomalías registradas.
                </td>
              </tr>
            ) : (
              sortedAnomalies.map((anom) => (
                <tr key={anom.id} className="hover:bg-slate-50/80 transition-colors">
                  {showMeterId && (
                    <td className="px-6 py-4 font-mono font-semibold text-slate-900">
                      <Link href={`/meters/${anom.meter_id}`} className="hover:underline text-emerald-600">
                        {anom.meter_id}
                      </Link>
                    </td>
                  )}
                  <td className="px-6 py-4 w-64">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold ${getAnomalyTypeBadgeClass(anom.type)}`}>
                      {translateAnomalyType(anom.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 w-28">
                    <span className={`font-semibold ${getSeverityBadgeClass(anom.severity)}`}>
                      {translateSeverity(anom.severity)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-mono w-24">
                    {(anom.confidence * 100).toFixed(0)}%
                  </td>
                  <td className="px-6 py-4 text-slate-600 max-w-[200px] truncate" title={anom.reason}>
                    {anom.reason}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-600 w-52">
                    {new Date(anom.detected_at).toLocaleString('es-ES', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 text-right w-28">
                    <Link
                      href={`/anomalies/${anom.id}`}
                      className="text-xs bg-white hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded border border-slate-200 transition-colors shadow-2xs"
                    >
                      Investigar
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
