export const ANOMALY_TYPE_OPTIONS = [
  { label: 'Todos los Tipos', value: 'ALL' },
  { label: 'Anomalía Real', value: 'REAL_ANOMALY' },
  { label: 'Anomalía Explicable', value: 'EXPLAINABLE_ANOMALY' },
  { label: 'Falso Positivo', value: 'FALSE_POSITIVE' },
  { label: 'Calidad de Datos', value: 'DATA_QUALITY' },
];

export const SEVERITY_FILTER_OPTIONS = [
  { label: 'Todas las Severidades', value: 'ALL' },
  { label: 'Alta (HIGH)', value: 'HIGH' },
  { label: 'Media (MEDIUM)', value: 'MEDIUM' },
  { label: 'Baja (LOW)', value: 'LOW' },
];

export const ANOMALY_SORT_OPTIONS = [
  { label: 'Ordenar por Severidad', value: 'DEFAULT' },
  { label: 'Mayor a Menor Severidad', value: 'HIGH_TO_LOW' },
  { label: 'Menor a Mayor Severidad', value: 'LOW_TO_HIGH' },
];
