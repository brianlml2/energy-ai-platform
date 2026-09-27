package utils

import (
	"database/sql"
	"encoding/csv"
	"fmt"
	"io"
	"os"
	"strings"
	"time"
)

func ImportCSV(db *sql.DB, filePath string, preExecSQL string, rowHandler func(tx *sql.Tx, record []string, colIdx map[string]int) error) error {
	file, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	header, err := reader.Read()
	if err != nil {
		return err
	}

	colIdx := make(map[string]int)
	for i, col := range header {
		colIdx[strings.TrimSpace(col)] = i
	}

	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if preExecSQL != "" {
		if _, err := tx.Exec(preExecSQL); err != nil {
			return err
		}
	}

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return err
		}

		if err := rowHandler(tx, record, colIdx); err != nil {
			return err
		}
	}

	return tx.Commit()
}

func ParseTimestamp(timeStr string) (time.Time, error) {
	formats := []string{
		"2006-01-02 15:04:05",
		"2006-01-02 15:04",
		time.RFC3339,
	}
	for _, fmtStr := range formats {
		if t, err := time.Parse(fmtStr, timeStr); err == nil {
			return t, nil
		}
	}
	return time.Time{}, fmt.Errorf("invalid timestamp format: %s", timeStr)
}
