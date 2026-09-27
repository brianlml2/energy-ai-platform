'use client';

import React, { useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { translateAuthError } from '@/config/translations';
import { Zap, Lock, Mail, User, ArrowRight, CheckCircle2, Loader2, XCircle } from 'lucide-react';

function LoginPageContent() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        const { error: signUpError, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });
        if (signUpError) throw signUpError;

        if (data.session) {
          router.push('/');
        } else {
          // Attempt immediate sign in after sign up
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (signInError) {
            setSuccessMsg('¡Cuenta creada con éxito! Ya puede iniciar sesión.');
            setIsSignUp(false);
          } else {
            router.push('/');
          }
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.push('/');
      }
    } catch (err: any) {
      setError(translateAuthError(err.message || 'Ocurrió un error en la autenticación'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 p-6">
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center mx-auto shadow-sm">
            <Zap className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Bia Energy AI</h1>
          <p className="text-xs text-slate-500">Plataforma de Gestión y Autenticación Segura</p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(null); setSuccessMsg(null); }}
            className={`py-2 rounded-lg transition-all ${!isSignUp ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(null); setSuccessMsg(null); }}
            className={`py-2 rounded-lg transition-all ${isSignUp ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Registrarse
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 text-xs flex items-start gap-3 shadow-2xs animate-in fade-in duration-200">
            <div className="p-1 bg-red-100 text-red-600 rounded-lg shrink-0">
              <XCircle className="w-4 h-4" />
            </div>
            <div className="flex-1 pt-0.5">
              <p className="font-bold text-red-900">Error de Autenticación</p>
              <p className="text-red-700 mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs flex items-start gap-3 shadow-2xs animate-in fade-in duration-200">
            <div className="p-1 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex-1 pt-0.5">
              <p className="font-bold text-emerald-900">Éxito</p>
              <p className="text-emerald-700 mt-0.5 leading-relaxed">{successMsg}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required={isSignUp}
                  placeholder="Brian Arias"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="analista@biaenergy.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Procesando...
              </>
            ) : (
              <>
                <span>{isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Cargando autenticación...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
