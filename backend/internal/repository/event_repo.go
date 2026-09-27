package repository

import (
	"database/sql"
	"github.com/biaenergy/energy-ai-backend/internal/domain"
)

type EventRepo struct {
	db *sql.DB
}

func NewEventRepo(db *sql.DB) *EventRepo {
	return &EventRepo{db: db}
}

func (r *EventRepo) GetByMeterID(meterID string) ([]domain.Event, error) {
	rows, err := r.db.Query("SELECT id, meter_id, event_timestamp, event_type, description FROM events WHERE meter_id = $1 ORDER BY event_timestamp ASC", meterID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []domain.Event
	for rows.Next() {
		var ev domain.Event
		if err := rows.Scan(&ev.ID, &ev.MeterID, &ev.EventTimestamp, &ev.EventType, &ev.Description); err != nil {
			return nil, err
		}
		events = append(events, ev)
	}
	return events, nil
}
