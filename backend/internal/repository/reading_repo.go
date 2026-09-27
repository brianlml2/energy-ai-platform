package repository

import (
	"database/sql"
	"fmt"
	"github.com/biaenergy/energy-ai-backend/internal/domain"
)

type ReadingRepo struct {
	db *sql.DB
}

func NewReadingRepo(db *sql.DB) *ReadingRepo {
	return &ReadingRepo{db: db}
}

func (r *ReadingRepo) GetByMeterID(meterID string, limit int) ([]domain.Reading, error) {
	query := "SELECT id, meter_id, timestamp, consumption_kwh, voltage_v, current_a, power_factor, status FROM readings WHERE meter_id = $1 ORDER BY timestamp DESC"
	if limit > 0 {
		query += fmtLimit(limit)
	}

	rows, err := r.db.Query(query, meterID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var readings []domain.Reading
	for rows.Next() {
		var rd domain.Reading
		if err := rows.Scan(&rd.ID, &rd.MeterID, &rd.Timestamp, &rd.ConsumptionKwh, &rd.VoltageV, &rd.CurrentA, &rd.PowerFactor, &rd.Status); err != nil {
			return nil, err
		}
		readings = append(readings, rd)
	}
	return readings, nil
}

func (r *ReadingRepo) GetAllForMeter(meterID string) ([]domain.Reading, error) {
	rows, err := r.db.Query("SELECT id, meter_id, timestamp, consumption_kwh, voltage_v, current_a, power_factor, status FROM readings WHERE meter_id = $1 ORDER BY timestamp ASC", meterID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var readings []domain.Reading
	for rows.Next() {
		var rd domain.Reading
		if err := rows.Scan(&rd.ID, &rd.MeterID, &rd.Timestamp, &rd.ConsumptionKwh, &rd.VoltageV, &rd.CurrentA, &rd.PowerFactor, &rd.Status); err != nil {
			return nil, err
		}
		readings = append(readings, rd)
	}
	return readings, nil
}

func (r *ReadingRepo) GetConsumptionStats() (float64, float64, float64, error) {
	query := `
		WITH max_t AS (
			SELECT MAX(timestamp) as t FROM readings
		),
		total_sum AS (
			SELECT COALESCE(SUM(consumption_kwh), 0) as total FROM readings
		),
		current_period AS (
			SELECT COALESCE(SUM(consumption_kwh), 0) as total
			FROM readings, max_t
			WHERE timestamp >= max_t.t - INTERVAL '7 days' AND timestamp <= max_t.t
		),
		prev_period AS (
			SELECT COALESCE(SUM(consumption_kwh), 0) as total
			FROM readings, max_t
			WHERE timestamp >= max_t.t - INTERVAL '14 days' AND timestamp < max_t.t - INTERVAL '7 days'
		)
		SELECT 
			(SELECT total FROM total_sum),
			(SELECT total FROM current_period),
			(SELECT total FROM prev_period)
	`
	var totalConsumption, currentTotal, prevTotal float64
	err := r.db.QueryRow(query).Scan(&totalConsumption, &currentTotal, &prevTotal)
	return totalConsumption, currentTotal, prevTotal, err
}

func fmtLimit(limit int) string {
	return fmt.Sprintf(" LIMIT %d", limit)
}
