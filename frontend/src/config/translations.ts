import { AnomalyType, SeverityLevel } from '@/types/api';

export const translateSeverity = (severity: SeverityLevel | string): string => {
  switch (severity?.toUpperCase()) {
    case 'HIGH':
      return 'ALTA';
    case 'MEDIUM':
      return 'MEDIA';
    case 'LOW':
      return 'BAJA';
    default:
      return severity;
  }
};

export const translateAnomalyType = (type: AnomalyType | string): string => {
  switch (type?.toUpperCase()) {
    case 'REAL_ANOMALY':
      return 'ANOMALÍA REAL';
    case 'EXPLAINABLE_ANOMALY':
      return 'ANOMALÍA EXPLICABLE';
    case 'FALSE_POSITIVE':
      return 'FALSO POSITIVO';
    case 'DATA_QUALITY':
      return 'CALIDAD DE DATOS';
    case 'NORMAL':
      return 'NORMAL';
    default:
      return type;
  }
};

export const getAnomalyTypeBadgeClass = (type: AnomalyType | string): string => {
  switch (type?.toUpperCase()) {
    case 'REAL_ANOMALY':
      return 'bg-red-100 text-red-600';
    case 'EXPLAINABLE_ANOMALY':
      return 'bg-amber-100 text-amber-600';
    case 'FALSE_POSITIVE':
      return 'bg-sky-100 text-sky-600';
    case 'DATA_QUALITY':
      return 'bg-indigo-100 text-indigo-700';
    case 'NORMAL':
      return 'bg-emerald-100 text-emerald-600';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

export const getSeverityBadgeClass = (severity: SeverityLevel | string): string => {
  switch (severity?.toUpperCase()) {
    case 'HIGH':
      return 'inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-red-100 text-red-600';
    case 'MEDIUM':
      return 'inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-amber-100 text-amber-600';
    case 'LOW':
      return 'inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-sky-100 text-sky-600';
    default:
      return 'inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-600';
  }
};

export const translateAuthError = (message: string): string => {
  const lower = message?.toLowerCase() || '';
  if (lower.includes('invalid login credentials')) {
    return 'Credenciales inválidas. Por favor verifique su correo y contraseña.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Correo electrónico no confirmado. Por favor verifique su bandeja de entrada.';
  }
  if (lower.includes('user already registered')) {
    return 'El usuario ya se encuentra registrado. Por favor inicie sesión.';
  }
  if (lower.includes('password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  return message;
};
