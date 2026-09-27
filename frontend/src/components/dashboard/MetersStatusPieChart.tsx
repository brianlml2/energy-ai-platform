'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface MetersStatusPieChartProps {
  pieData: Array<{ name: string; value: number; color: string }>;
  totalMetersCount: number;
}

export function MetersStatusPieChart({ pieData, totalMetersCount }: MetersStatusPieChartProps) {
  return (
    <div className="bg-white border border-slate-200 shadow-2xs rounded p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Estado de los Medidores</h3>
          <p className="text-xs text-slate-500">Distribución actual de la flota</p>
        </div>
        <Link
          href="/meters"
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors shadow-2xs shrink-0"
        >
          Ver listado <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex items-center justify-center my-4 relative">
        <div className="w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={75} paddingAngle={4}>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip wrapperStyle={{ zIndex: 50 }} formatter={(value: any) => [value, 'Cantidad']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Center total count */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <span className="text-2xl font-bold text-slate-900">{totalMetersCount}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Medidores</span>
        </div>
      </div>

      <div className="space-y-2 border-t border-slate-100 pt-3">
        {pieData.map((item) => {
          const total = totalMetersCount > 0 ? totalMetersCount : 1;
          const pct = Math.round((item.value / total) * 100);
          return (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                <span className="font-medium text-slate-700">{item.name}</span>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <span className="font-bold text-slate-900">{item.value}</span>
                <span className="text-slate-500 text-[11px]">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
