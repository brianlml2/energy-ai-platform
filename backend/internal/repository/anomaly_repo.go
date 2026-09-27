package repository

import (
	"database/sql"
	"encoding/json"
	"github.com/biaenergy/energy-ai-backend/internal/domain"
	"time"
)

type AnomalyRepo struct {
	db *sql.DB
}

func NewAnomalyRepo(db *sql.DB) *AnomalyRepo {
	return &AnomalyRepo{db: db}
}

func (r *AnomalyRepo) Save(a *domain.Anomaly) error {
	evidenceJSON, _ := json.Marshal(a.Evidence)
	eventsJSON, _ := json.Marshal(a.KnownEvents)

	query := `
		INSERT INTO anomalies (meter_id, detected_at, type, severity, confidence, variation_percent, baseline, consumption, reason, recommended_action, status, evidence, known_events)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		RETURNING id
	`
	return r.db.QueryRow(
		query,
		a.MeterID,
		a.DetectedAt,
		a.Type,
		a.Severity,
		a.Confidence,
		a.VariationPercent,
		a.Baseline,
		a.Consumption,
		a.Reason,
		a.RecommendedAction,
		a.Status,
		evidenceJSON,
		eventsJSON,
	).Scan(&a.ID)
}

func (r *AnomalyRepo) GetAll() ([]domain.Anomaly, error) {
	rows, err := r.db.Query(`
		SELECT id, meter_id, detected_at, type, severity, confidence, variation_percent, baseline, consumption, reason, recommended_action, status, evidence, known_events
		FROM anomalies ORDER BY detected_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.Anomaly
	for rows.Next() {
		var a domain.Anomaly
		var evidenceBytes, eventsBytes []byte
		if err := rows.Scan(
			&a.ID, &a.MeterID, &a.DetectedAt, &a.Type, &a.Severity, &a.Confidence,
			&a.VariationPercent, &a.Baseline, &a.Consumption, &a.Reason, &a.RecommendedAction,
			&a.Status, &evidenceBytes, &eventsBytes,
		); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(evidenceBytes, &a.Evidence)
		_ = json.Unmarshal(eventsBytes, &a.KnownEvents)
		list = append(list, a)
	}
	return list, nil
}

func (r *AnomalyRepo) GetByID(id int64) (*domain.Anomaly, error) {
	row := r.db.QueryRow(`
		SELECT id, meter_id, detected_at, type, severity, confidence, variation_percent, baseline, consumption, reason, recommended_action, status, evidence, known_events
		FROM anomalies WHERE id = $1
	`, id)

	var a domain.Anomaly
	var evidenceBytes, eventsBytes []byte
	if err := row.Scan(
		&a.ID, &a.MeterID, &a.DetectedAt, &a.Type, &a.Severity, &a.Confidence,
		&a.VariationPercent, &a.Baseline, &a.Consumption, &a.Reason, &a.RecommendedAction,
		&a.Status, &evidenceBytes, &eventsBytes,
	); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	_ = json.Unmarshal(evidenceBytes, &a.Evidence)
	_ = json.Unmarshal(eventsBytes, &a.KnownEvents)
	return &a, nil
}

func (r *AnomalyRepo) GetLastAnalysisTime() (*time.Time, error) {
	var t sql.NullTime
	err := r.db.QueryRow("SELECT MAX(created_at) FROM ai_analyses").Scan(&t)
	if err != nil || !t.Valid {
		return nil, nil
	}
	return &t.Time, nil
}
