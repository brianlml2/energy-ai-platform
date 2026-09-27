package ai

import (
	"context"
)

type AIInput struct {
	MeterID          string   `json:"meter_id"`
	Classification   string   `json:"classification"`
	Severity         string   `json:"severity"`
	VariationPercent float64  `json:"variation_percent"`
	Baseline         float64  `json:"baseline"`
	Consumption      float64  `json:"consumption"`
	KnownEvents      []string `json:"known_events"`
	Evidence         []string `json:"evidence"`
}

type AIResponse struct {
	Reason            string `json:"reason"`
	RecommendedAction string `json:"recommended_action"`
}

type AIProvider interface {
	Explain(ctx context.Context, input AIInput) (AIResponse, error)
}
