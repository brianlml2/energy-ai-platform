package analytics

import (
	"github.com/biaenergy/energy-ai-backend/internal/domain"
)

// CalculateBaseline computes the baseline (average or median expected consumption) for a meter.
func CalculateBaseline(readings []domain.Reading) float64 {
	if len(readings) == 0 {
		return 0
	}
	var sum float64
	for _, r := range readings {
		sum += r.ConsumptionKwh
	}
	return sum / float64(len(readings))
}

// CalculateRecentAverage computes the average consumption over the last N readings (e.g. latest 24 hours or peak period).
func CalculateRecentAverage(readings []domain.Reading, count int) float64 {
	if len(readings) == 0 {
		return 0
	}
	if count > len(readings) {
		count = len(readings)
	}
	// Take last 'count' readings
	start := len(readings) - count
	var sum float64
	for i := start; i < len(readings); i++ {
		sum += readings[i].ConsumptionKwh
	}
	return sum / float64(count)
}
