package domain

import (
	"time"
)

// Custom types for enums
type AnomalyType string
type SeverityLevel string
type AnalysisStatus string
type MeterStatus string

// Anomaly type constants
const (
	AnomalyTypeReal        AnomalyType = "REAL_ANOMALY"
	AnomalyTypeExplainable AnomalyType = "EXPLAINABLE_ANOMALY"
	AnomalyTypeFalsePos    AnomalyType = "FALSE_POSITIVE"
	AnomalyTypeDataQuality AnomalyType = "DATA_QUALITY"
	AnomalyTypeNormal      AnomalyType = "NORMAL"
)

// Severity constants
const (
	SeverityHigh   SeverityLevel = "HIGH"
	SeverityMedium SeverityLevel = "MEDIUM"
	SeverityLow    SeverityLevel = "LOW"
)

// Analysis status constants
const (
	AnalysisStatusPending   AnalysisStatus = "PENDING"
	AnalysisStatusRunning   AnalysisStatus = "RUNNING"
	AnalysisStatusCompleted AnalysisStatus = "COMPLETED"
	AnalysisStatusFailed    AnalysisStatus = "FAILED"
)

// Meter status constants
const (
	MeterStatusActive      MeterStatus = "ACTIVE"
	MeterStatusInactive    MeterStatus = "INACTIVE"
	MeterStatusMaintenance MeterStatus = "MAINTENANCE"
)

type Meter struct {
	ID        int64       `json:"id"`
	MeterID   string      `json:"meter_id"`
	Name      string      `json:"name"`
	Location  string      `json:"location"`
	Status    MeterStatus `json:"status"`
	CreatedAt time.Time   `json:"created_at"`
}

type Reading struct {
	ID             int64     `json:"id"`
	MeterID        string    `json:"meter_id"`
	Timestamp      time.Time `json:"timestamp"`
	ConsumptionKwh float64   `json:"consumption_kwh"`
	VoltageV       float64   `json:"voltage_v"`
	CurrentA       float64   `json:"current_a"`
	PowerFactor    float64   `json:"power_factor"`
	Status         string    `json:"status"`
}

type Event struct {
	ID               int64     `json:"id"`
	MeterID          string    `json:"meter_id"`
	EventTimestamp   time.Time `json:"event_timestamp"`
	EventType        string    `json:"event_type"`
	Description      string    `json:"description"`
}

type Anomaly struct {
	ID                int64         `json:"id"`
	MeterID           string        `json:"meter_id"`
	DetectedAt        time.Time     `json:"detected_at"`
	Type              AnomalyType   `json:"type"`
	Severity          SeverityLevel `json:"severity"`
	Confidence        float64       `json:"confidence"`
	VariationPercent  float64       `json:"variation_percent"`
	Baseline          float64       `json:"baseline"`
	Consumption       float64       `json:"consumption"`
	KnownEvents       []Event       `json:"known_events"`
	Evidence          []string      `json:"evidence"`
	Reason            string        `json:"reason"`
	RecommendedAction string        `json:"recommended_action"`
	Status            string        `json:"status"`
}

type AIAnalysis struct {
	ID        int64          `json:"id"`
	MeterID   string         `json:"meter_id"`
	Status    AnalysisStatus `json:"status"`
	Result    *Anomaly       `json:"result,omitempty"`
	CreatedAt time.Time      `json:"created_at"`
}

type DashboardSummary struct {
	TotalMeters              int        `json:"total_meters"`
	ActiveAnomalies          int        `json:"active_anomalies"`
	HighSeverity             int        `json:"high_severity"`
	DataQualityIssues        int        `json:"data_quality_issues"`
	TotalConsumption         float64    `json:"total_consumption_kwh"`
	ConsumptionChangePercent float64    `json:"consumption_change_percent"`
	LastAnalysisAt           *time.Time `json:"last_analysis_at,omitempty"`
}
