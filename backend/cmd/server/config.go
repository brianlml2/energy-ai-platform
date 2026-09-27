package main

import (
	"os"
)

type Config struct {
	DatabaseURL     string
	Port            string
	ReadingsCSVPath string
	EventsCSVPath   string
}

func loadConfig() Config {
	return Config{
		DatabaseURL: getEnv(
			"DATABASE_URL",
			"postgres://postgres:postgres@localhost:5432/energy_ai?sslmode=disable",
		),
		Port:            getEnv("PORT", "8080"),
		ReadingsCSVPath: getEnv("READINGS_CSV_PATH", "./data/readings.csv"),
		EventsCSVPath:   getEnv("EVENTS_CSV_PATH", "./data/events.csv"),
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return fallback
}
