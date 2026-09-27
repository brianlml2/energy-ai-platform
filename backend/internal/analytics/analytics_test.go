package analytics

import (
	"testing"
	"time"
	"github.com/biaenergy/energy-ai-backend/internal/domain"
)

func TestCalculateBaseline(t *testing.T) {
	readings := []domain.Reading{
		{ConsumptionKwh: 100},
		{ConsumptionKwh: 200},
		{ConsumptionKwh: 300},
	}
	baseline := CalculateBaseline(readings)
	if baseline != 200 {
		t.Errorf("Expected baseline 200, got %.1f", baseline)
	}
}

func TestAnalyzeMeterM109(t *testing.T) {
	// M-109: REAL_ANOMALY, HIGH severity, high variation (>100%), no events
	readings := []domain.Reading{
		{ConsumptionKwh: 1000, VoltageV: 220, PowerFactor: 0.9, Timestamp: time.Now().Add(-2 * time.Hour)},
		{ConsumptionKwh: 1070, VoltageV: 220, PowerFactor: 0.9, Timestamp: time.Now().Add(-1 * time.Hour)},
		{ConsumptionKwh: 2180, VoltageV: 220, CurrentA: 50, PowerFactor: 0.9, Timestamp: time.Now()},
	}
	events := []domain.Event{}

	result := AnalyzeMeter("M-109", readings, events)

	if result.Type != domain.AnomalyTypeReal {
		t.Errorf("Expected REAL_ANOMALY, got %s", result.Type)
	}
	if result.Severity != domain.SeverityHigh {
		t.Errorf("Expected HIGH severity, got %s", result.Severity)
	}
	if result.VariationPercent <= 50.0 {
		t.Errorf("Expected positive variation, got %.1f%%", result.VariationPercent)
	}
}

func TestAnalyzeMeterM104(t *testing.T) {
	// M-104: EXPLAINABLE_ANOMALY, MEDIUM severity, new production line
	readings := []domain.Reading{
		{ConsumptionKwh: 500, VoltageV: 220, PowerFactor: 0.95, Timestamp: time.Now().Add(-2 * time.Hour)},
		{ConsumptionKwh: 520, VoltageV: 220, PowerFactor: 0.95, Timestamp: time.Now().Add(-1 * time.Hour)},
		{ConsumptionKwh: 750, VoltageV: 220, CurrentA: 30, PowerFactor: 0.95, Timestamp: time.Now()},
	}
	events := []domain.Event{
		{EventType: "OPERATIONAL_CHANGE", Description: "New production line activated"},
	}

	result := AnalyzeMeter("M-104", readings, events)

	if result.Type != domain.AnomalyTypeExplainable {
		t.Errorf("Expected EXPLAINABLE_ANOMALY, got %s", result.Type)
	}
	if result.Severity != domain.SeverityMedium {
		t.Errorf("Expected MEDIUM severity, got %s", result.Severity)
	}
}

func TestAnalyzeMeterM106(t *testing.T) {
	// M-106: FALSE_POSITIVE, LOW severity, scheduled shutdown
	readings := []domain.Reading{
		{ConsumptionKwh: 800, VoltageV: 220, PowerFactor: 0.9, Timestamp: time.Now().Add(-2 * time.Hour)},
		{ConsumptionKwh: 810, VoltageV: 220, PowerFactor: 0.9, Timestamp: time.Now().Add(-1 * time.Hour)},
		{ConsumptionKwh: 100, VoltageV: 220, CurrentA: 5, PowerFactor: 0.9, Timestamp: time.Now()},
	}
	events := []domain.Event{
		{EventType: "SCHEDULED_OUTAGE", Description: "Scheduled maintenance outage for 12 hours"},
	}

	result := AnalyzeMeter("M-106", readings, events)

	if result.Type != domain.AnomalyTypeFalsePos {
		t.Errorf("Expected FALSE_POSITIVE, got %s", result.Type)
	}
	if result.Severity != domain.SeverityLow {
		t.Errorf("Expected LOW severity, got %s", result.Severity)
	}
}

func TestAnalyzeMeterM112(t *testing.T) {
	// M-112: DATA_QUALITY, HIGH severity, stable consumption, fluctuating voltage
	readings := []domain.Reading{
		{ConsumptionKwh: 500, VoltageV: 180, PowerFactor: 0.9, Timestamp: time.Now().Add(-2 * time.Hour)},
		{ConsumptionKwh: 502, VoltageV: 240, PowerFactor: 0.9, Timestamp: time.Now().Add(-1 * time.Hour)},
		{ConsumptionKwh: 501, VoltageV: 200, PowerFactor: 0.9, Timestamp: time.Now()},
	}
	events := []domain.Event{}

	result := AnalyzeMeter("M-112", readings, events)

	if result.Type != domain.AnomalyTypeDataQuality {
		t.Errorf("Expected DATA_QUALITY, got %s", result.Type)
	}
	if result.Severity != domain.SeverityHigh {
		t.Errorf("Expected HIGH severity, got %s", result.Severity)
	}
}
