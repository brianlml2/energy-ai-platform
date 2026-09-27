export type AnomalyType = 'REAL_ANOMALY' | 'EXPLAINABLE_ANOMALY' | 'FALSE_POSITIVE' | 'DATA_QUALITY' | 'NORMAL';

export type SeverityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type AnalysisStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export type MeterStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export interface Meter {
  id: number;
  meter_id: string;
  name: string;
  location: string;
  status: MeterStatus;
  created_at: string;
}

export interface Reading {
  id: number;
  meter_id: string;
  timestamp: string;
  consumption_kwh: number;
  voltage_v: number;
  current_a: number;
  power_factor: number;
  status: string;
}

export interface EventItem {
  id: number;
  meter_id: string;
  event_timestamp: string;
  event_type: string;
  description: string;
}

export interface Anomaly {
  id: number;
  meter_id: string;
  detected_at: string;
  type: AnomalyType;
  severity: SeverityLevel;
  confidence: number;
  variation_percent?: number;
  baseline?: number;
  consumption?: number;
  known_events?: EventItem[];
  evidence?: string[];
  reason: string;
  recommended_action: string;
  status: string;
}

export interface AIAnalysis {
  id: number;
  meter_id: string;
  status: AnalysisStatus;
  result?: Anomaly;
  created_at: string;
}

export interface DashboardSummary {
  total_meters: number;
  active_anomalies: number;
  high_severity: number;
  data_quality_issues: number;
  total_consumption_kwh?: number;
  consumption_change_percent?: number;
  last_analysis_at?: string | null;
}

export interface AnalyzeRequest {
  meter_id: string;
}

export interface AnalyzeResponse {
  analysis_id: number;
  status: AnalysisStatus;
  meter_id: string;
}
