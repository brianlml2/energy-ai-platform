package services

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"github.com/biaenergy/energy-ai-backend/internal/ai"
	"github.com/biaenergy/energy-ai-backend/internal/analytics"
	"github.com/biaenergy/energy-ai-backend/internal/domain"
	"github.com/biaenergy/energy-ai-backend/internal/repository"
	"time"
)

type AnalysisService struct {
	db          *sql.DB
	meterRepo   *repository.MeterRepo
	readingRepo *repository.ReadingRepo
	eventRepo   *repository.EventRepo
	anomalyRepo *repository.AnomalyRepo
	aiProvider  ai.AIProvider
}

func NewAnalysisService(
	db *sql.DB,
	meterRepo *repository.MeterRepo,
	readingRepo *repository.ReadingRepo,
	eventRepo *repository.EventRepo,
	anomalyRepo *repository.AnomalyRepo,
	aiProvider ai.AIProvider,
) *AnalysisService {
	return &AnalysisService{
		db:          db,
		meterRepo:   meterRepo,
		readingRepo: readingRepo,
		eventRepo:   eventRepo,
		anomalyRepo: anomalyRepo,
		aiProvider:  aiProvider,
	}
}

func (s *AnalysisService) StartAnalysis(ctx context.Context, meterID string) (int64, error) {
	var analysisID int64
	err := s.db.QueryRow(`
		INSERT INTO ai_analyses (meter_id, status, created_at)
		VALUES ($1, $2, $3)
		RETURNING id
	`, meterID, string(domain.AnalysisStatusPending), time.Now()).Scan(&analysisID)
	if err != nil {
		return 0, err
	}

	go s.runAnalysis(context.Background(), analysisID, meterID)

	return analysisID, nil
}

func (s *AnalysisService) GetAnalysis(analysisID int64) (*domain.AIAnalysis, error) {
	row := s.db.QueryRow(`
		SELECT id, meter_id, status, result, created_at
		FROM ai_analyses WHERE id = $1
	`, analysisID)

	var an domain.AIAnalysis
	var resultBytes []byte
	var resultJSON sql.NullString
	if err := row.Scan(&an.ID, &an.MeterID, &an.Status, &resultJSON, &an.CreatedAt); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	if resultJSON.Valid && resultJSON.String != "" {
		var anomaly domain.Anomaly
		if err := json.Unmarshal([]byte(resultJSON.String), &anomaly); err == nil {
			an.Result = &anomaly
		}
	}

	_ = resultBytes
	return &an, nil
}

func (s *AnalysisService) runAnalysis(ctx context.Context, analysisID int64, meterID string) {
	_, _ = s.db.Exec("UPDATE ai_analyses SET status = $1 WHERE id = $2", string(domain.AnalysisStatusRunning), analysisID)

	readings, err := s.readingRepo.GetAllForMeter(meterID)
	if err != nil {
		_, _ = s.db.Exec("UPDATE ai_analyses SET status = $1 WHERE id = $2", string(domain.AnalysisStatusFailed), analysisID)
		return
	}

	events, err := s.eventRepo.GetByMeterID(meterID)
	if err != nil {
		events = []domain.Event{}
	}

	analysisResult := analytics.AnalyzeMeter(meterID, readings, events)

	var knownEventDescriptions []string
	for _, ev := range events {
		knownEventDescriptions = append(knownEventDescriptions, ev.Description)
	}

	aiInput := ai.AIInput{
		MeterID:          meterID,
		Classification:   string(analysisResult.Type),
		Severity:         string(analysisResult.Severity),
		VariationPercent: analysisResult.VariationPercent,
		Baseline:         analysisResult.Baseline,
		Consumption:      analysisResult.Consumption,
		KnownEvents:      knownEventDescriptions,
		Evidence:         analysisResult.Evidence,
	}

	aiResp, err := s.aiProvider.Explain(ctx, aiInput)
	if err != nil {
		aiResp = ai.AIResponse{
			Reason:            fmt.Sprintf("Detected %s anomaly with variation %.1f%%", analysisResult.Type, analysisResult.VariationPercent),
			RecommendedAction: "Investigate meter installation.",
		}
	}

	anomaly := domain.Anomaly{
		MeterID:           meterID,
		DetectedAt:        time.Now(),
		Type:              analysisResult.Type,
		Severity:          analysisResult.Severity,
		Confidence:        analysisResult.Confidence,
		VariationPercent:  analysisResult.VariationPercent,
		Baseline:          analysisResult.Baseline,
		Consumption:       analysisResult.Consumption,
		KnownEvents:       events,
		Evidence:          analysisResult.Evidence,
		Reason:            aiResp.Reason,
		RecommendedAction: aiResp.RecommendedAction,
		Status:            "OPEN",
	}

	_ = s.anomalyRepo.Save(&anomaly)

	anomalyBytes, _ := json.Marshal(anomaly)
	_, _ = s.db.Exec("UPDATE ai_analyses SET status = $1, result = $2 WHERE id = $3", string(domain.AnalysisStatusCompleted), string(anomalyBytes), analysisID)
}
