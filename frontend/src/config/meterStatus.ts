import { MeterStatus } from '@/types/api';

export const METER_STATUS: Record<string, MeterStatus> = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  MAINTENANCE: 'MAINTENANCE',
};

export interface MeterStatusConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
}

export const METER_STATUS_CONFIG: Record<MeterStatus, MeterStatusConfig> = {
  ACTIVE: {
    label: 'Activo',
    badgeClass: 'bg-emerald-100 text-emerald-600',
    dotClass: 'bg-emerald-600',
  },
  INACTIVE: {
    label: 'Inactivo',
    badgeClass: 'bg-slate-200 text-slate-600',
    dotClass: 'bg-slate-600',
  },
  MAINTENANCE: {
    label: 'Mantenimiento',
    badgeClass: 'bg-amber-100 text-amber-600',
    dotClass: 'bg-amber-600',
  },
};
