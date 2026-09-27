package importer

import (
	"database/sql"
	"fmt"
	"strconv"
	"github.com/biaenergy/energy-ai-backend/internal/utils"
)

func RunImport(db *sql.DB, readingsPath, eventsPath string) error {
	if err := importMetersAndReadings(db, readingsPath); err != nil {
		return fmt.Errorf("failed to import readings: %w", err)
	}

	if err := importEvents(db, eventsPath); err != nil {
		return fmt.Errorf("failed to import events: %w", err)
	}

	return nil
}

func importMetersAndReadings(db *sql.DB, filePath string) error {
	meterMap := make(map[string]bool)

	insertMeterQuery := `
		INSERT INTO meters (meter_id, name, location, status)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (meter_id) DO NOTHING
	`
	insertReadingQuery := `
		INSERT INTO readings (meter_id, timestamp, consumption_kwh, voltage_v, current_a, power_factor, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT (meter_id, timestamp) DO NOTHING
	`

	return utils.ImportCSV(db, filePath, "", func(tx *sql.Tx, record []string, colIdx map[string]int) error {
		meterID := record[colIdx["meter_id"]]
		timestampStr := record[colIdx["timestamp"]]
		consumptionStr := record[colIdx["consumption_kwh"]]
		voltageStr := record[colIdx["voltage_v"]]
		currentStr := record[colIdx["current_a"]]
		powerFactorStr := record[colIdx["power_factor"]]
		status := record[colIdx["status"]]

		if !meterMap[meterID] {
			meterMap[meterID] = true
			if _, err := tx.Exec(insertMeterQuery, meterID, "Meter "+meterID, "Main Facility", "ACTIVE"); err != nil {
				return err
			}
		}

		timestamp, err := utils.ParseTimestamp(timestampStr)
		if err != nil {
			return err
		}

		consumption, _ := strconv.ParseFloat(consumptionStr, 64)
		voltage, _ := strconv.ParseFloat(voltageStr, 64)
		current, _ := strconv.ParseFloat(currentStr, 64)
		powerFactor, _ := strconv.ParseFloat(powerFactorStr, 64)

		_, err = tx.Exec(insertReadingQuery, meterID, timestamp, consumption, voltage, current, powerFactor, status)
		return err
	})
}

func importEvents(db *sql.DB, filePath string) error {
	deleteEventsQuery := `DELETE FROM events`
	insertEventQuery := `
		INSERT INTO events (meter_id, event_timestamp, event_type, description)
		VALUES ($1, $2, $3, $4)
	`

	return utils.ImportCSV(db, filePath, deleteEventsQuery, func(tx *sql.Tx, record []string, colIdx map[string]int) error {
		meterID := record[colIdx["meter_id"]]
		timeStr := record[colIdx["event_timestamp"]]
		eventType := record[colIdx["event_type"]]
		desc := record[colIdx["description"]]

		timestamp, err := utils.ParseTimestamp(timeStr)
		if err != nil {
			return err
		}

		_, err = tx.Exec(insertEventQuery, meterID, timestamp, eventType, desc)
		return err
	})
}
