import {
  DashboardSummary,
  Meter,
  Reading,
  Anomaly,
  AIAnalysis,
  AnalyzeResponse,
} from '@/types/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  if (!BASE_URL) {
    throw new Error('API configuration error: NEXT_PUBLIC_API_BASE_URL is not defined.');
  }

  const url = `${BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error: any) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network connection failed or request was blocked.');
  }
}

export const api = {
  getDashboardSummary: () => fetchAPI<DashboardSummary>('/dashboard/summary'),

  getMeters: () => fetchAPI<Meter[]>('/meters'),

  getMeterDetail: (meterId: string) => fetchAPI<Meter>(`/meters/${encodeURIComponent(meterId)}`),

  getMeterReadings: (meterId: string, limit?: number) =>
    fetchAPI<Reading[]>(`/meters/${encodeURIComponent(meterId)}/readings${limit !== undefined ? `?limit=${limit}` : ''}`),

  getAnomalies: () => fetchAPI<Anomaly[]>('/anomalies'),

  getAnomalyDetail: (id: number) => fetchAPI<Anomaly>(`/anomalies/${id}`),

  triggerAIAnalyze: (meterId: string) =>
    fetchAPI<AnalyzeResponse>('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({ meter_id: meterId }),
    }),

  getAIAnalysis: (id: number) => fetchAPI<AIAnalysis>(`/ai/analysis/${id}`),
};
