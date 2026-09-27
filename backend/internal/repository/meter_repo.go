package repository

import (
	"database/sql"
	"github.com/biaenergy/energy-ai-backend/internal/domain"
)

type MeterRepo struct {
	db *sql.DB
}

func NewMeterRepo(db *sql.DB) *MeterRepo {
	return &MeterRepo{db: db}
}

func (r *MeterRepo) GetAll() ([]domain.Meter, error) {
	rows, err := r.db.Query("SELECT id, meter_id, name, location, status, created_at FROM meters ORDER BY meter_id")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var meters []domain.Meter
	for rows.Next() {
		var m domain.Meter
		if err := rows.Scan(&m.ID, &m.MeterID, &m.Name, &m.Location, &m.Status, &m.CreatedAt); err != nil {
			return nil, err
		}
		meters = append(meters, m)
	}
	return meters, nil
}

func (r *MeterRepo) GetByMeterID(meterID string) (*domain.Meter, error) {
	row := r.db.QueryRow("SELECT id, meter_id, name, location, status, created_at FROM meters WHERE meter_id = $1", meterID)
	var m domain.Meter
	if err := row.Scan(&m.ID, &m.MeterID, &m.Name, &m.Location, &m.Status, &m.CreatedAt); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &m, nil
}
