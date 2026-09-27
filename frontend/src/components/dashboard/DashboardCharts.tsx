'use client';

import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

interface DashboardChartsProps {
  sampleReadings: Array<{ day: string; consumption: number }>;
  pieData: Array<{ name: string; value: number; color: string }>;
  totalMetersCount: number;
}

export function DashboardCharts({ sampleReadings, pieData, totalMetersCount }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Line Chart: Consumo total últimos 7 días */}
      <div className="lg:col-span-2 bg-white border border-slate-200 shadow-2xs rounded p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Consumo Total (Últimos 7 días)</h3>
            <p className="text-xs text-slate-500">Tendencia histórica de consumo del medidor de referencia</p>
          </div>
          <span className="text-xs bg-slate-100 border border-slate-200 text-slate-700 font-medium px-2.5 py-1 rounded">
            Telemetría Diaria
          </span>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sampleReadings}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.5rem', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="consumption" stroke="#0284c7" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Circular Chart: Estado de los medidores */}
      <div className="bg-white border border-slate-200 shadow-2xs rounded p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Estado de los Medidores</h3>
          <p className="text-xs text-slate-500">Distribución actual de la flota</p>
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
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
    </div>
  );
}
