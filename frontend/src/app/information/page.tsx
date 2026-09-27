'use client';

import React, { Suspense } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Info, GitBranch, Server, Database, Cpu, Globe, Code, KeyRound } from 'lucide-react';

function InformationContent() {
  const infoItems = [
    { label: 'Deployment', value: 'Railway', icon: Server },
    { label: 'Repositorio', value: 'https://github.com/brianlml2/energy-ai-platform.git', icon: GitBranch, isLink: true },
    { label: 'Frontend', value: 'Next.js (TypeScript, Tailwind CSS)', icon: Globe },
    { label: 'Backend', value: 'Golang (Go REST API)', icon: Code },
    { label: 'Base de datos', value: 'PostgreSQL', icon: Database },
    { label: 'Modelo IA de Investigación', value: 'gpt-4o-mini', icon: Cpu },
    { label: 'Servicios de login y registro', value: 'Supabase', icon: KeyRound },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Información del Sistema</h2>
        <p className="text-slate-600 text-sm mt-1">Detalles técnicos de la arquitectura, stack tecnológico y despliegue de la plataforma.</p>
      </div>

      <div className="bg-white border border-slate-200 shadow-2xs rounded overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-slate-100 text-slate-700 rounded">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Especificaciones de Arquitectura y Despliegue</h3>
            <p className="text-xs text-slate-500">Bia Energy AI Management Platform MVP</p>
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {infoItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 text-slate-500 rounded border border-slate-200">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                </div>
                <div>
                  {item.isLink ? (
                    <a
                      href={item.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono font-medium text-emerald-600 hover:underline bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200 inline-block"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded border border-slate-200 inline-block">
                      {item.value}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function InformationPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-12 text-center text-slate-500">Cargando información...</div>}>
        <InformationContent />
      </Suspense>
    </AppLayout>
  );
}
