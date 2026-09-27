'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Gauge, AlertTriangle, Cpu, Info, Zap, UserCircle, LogOut, ChevronDown, Menu, X } from 'lucide-react';
import { api } from '@/api/client';
import { supabase } from '@/lib/supabase/client';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isConnected, setIsConnected] = React.useState<boolean | null>(null);
  const [userName, setUserName] = React.useState<string | null>(null);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    async function checkHealthAndAuth() {
      try {
        const [healthRes, sessionRes] = await Promise.all([
          api.getDashboardSummary().catch(() => null),
          supabase.auth.getSession().catch(() => ({ data: { session: null } })),
        ]);
        setIsConnected(!!healthRes);

        const session = sessionRes?.data?.session;
        if (!session) {
          if (pathname !== '/login') {
            setIsRedirecting(true);
            router.push('/login');
            return;
          }
        } else if (session?.user) {
          setUserEmail(session.user.email || null);
          const fullName = session.user.user_metadata?.full_name;
          setUserName(fullName || session.user.email || 'Analista de Energía');
        }
      } catch {
        setIsConnected(false);
        if (pathname !== '/login') {
          setIsRedirecting(true);
          router.push('/login');
        }
      }
    }
    checkHealthAndAuth();
  }, [pathname, router]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    setUserName(null);
    setMenuOpen(false);
    router.push('/login');
  };

  const navItems = [
    { name: 'Panel Principal', href: '/', icon: LayoutDashboard },
    { name: 'Medidores', href: '/meters', icon: Gauge },
    { name: 'Anomalías IA', href: '/anomalies', icon: AlertTriangle },
    { name: 'Investigación IA', href: '/analysis', icon: Cpu },
    { name: 'Información', href: '/information', icon: Info },
  ];

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700 text-sm">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 text-center space-y-2">
          <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-semibold text-slate-900">No autenticado</p>
          <p className="text-xs text-slate-500">Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Mobile / Tablet Sidebar Overlay (< 1030px) */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-40 max-[1030px]:block min-[1031px]:hidden"
        />
      )}

      {/* Sidebar (Drawer below 1030px, fixed desktop from 1031px) */}
      <aside
        className={`w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-50 shadow-xs transition-transform duration-300 min-[1031px]:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : 'max-[1030px]:-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg text-white">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide text-slate-900">Bia Energy AI</h1>
              <p className="text-xs text-slate-500">Plataforma de Gestión</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 min-[1031px]:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>
            {isConnected === null
              ? 'Verificando...'
              : isConnected
              ? 'Conectado'
              : 'Desconectado'}
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected === null
                ? 'bg-yellow-500 animate-pulse'
                : isConnected
                ? 'bg-emerald-500'
                : 'bg-red-500'
            }`}
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-[1031px]:pl-64 flex flex-col min-h-screen w-full">
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors min-[1031px]:hidden cursor-pointer"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="relative" ref={menuRef}>
            {userName && (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <UserCircle className="w-6 h-6 text-slate-500" />
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-slate-900 leading-none truncate max-w-[160px]">{userName}</p>
                  <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Sesión Activa</p>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>
            )}

            {menuOpen && userName && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-medium text-slate-900 truncate">{userName}</p>
                  <p className="text-[10px] text-slate-500 truncate">{userEmail}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-600 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 bg-slate-50 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
