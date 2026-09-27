'use client';

import React, { Suspense } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Shield, Server } from 'lucide-react';

function ConfigurationContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Configuración del Sistema</h2>
        <p className="text-slate-600 text-sm mt-1">Gestione extremos de integración, ajustes de conexión del backend y parámetros de seguridad.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 shadow-2xs rounded p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-slate-100 rounded text-slate-700">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Integración API Backend</h3>
              <p className="text-xs text-slate-500">Parámetros de conexión REST API</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-500 block">URL Base</span>
              <code className="bg-slate-50 px-3 py-1.5 rounded border border-slate-200 text-xs font-mono text-slate-800 block mt-1">
                https://energy-ai-platform-production.up.railway.app/api/v1
              </code>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Protocolo de Integración</span>
              <span className="text-xs text-slate-700 font-medium">HTTPS / Contrato REST JSON (OpenAPI 3.0.3)</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-2xs rounded p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-slate-100 rounded text-slate-700">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Seguridad y Autenticación</h3>
              <p className="text-xs text-slate-500">Restricciones de alcance y cumplimiento</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-500 block">Módulo de Inicio de Sesión</span>
              <span className="text-xs text-slate-700 font-medium">Desactivado según los requisitos del MVP (Fuera de alcance)</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Credenciales de LLM y Base de Datos</span>
              <span className="text-xs text-slate-700 font-medium">Aseguradas exclusivamente en el entorno del backend</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfigurationPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-12 text-center text-slate-500">Cargando configuración...</div>}>
        <ConfigurationContent />
      </Suspense>
    </AppLayout>
  );
}
