package main

import (
	"log"
	"net/http"
	"os"

	"github.com/biaenergy/energy-ai-backend/internal/ai"
	"github.com/biaenergy/energy-ai-backend/internal/handlers"
	"github.com/biaenergy/energy-ai-backend/internal/importer"
	"github.com/biaenergy/energy-ai-backend/internal/repository"
	"github.com/biaenergy/energy-ai-backend/internal/services"
)

func main() {
	cfg := loadConfig()

	log.Println("Connecting to PostgreSQL...")
	db, err := repository.NewDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	readingsCsvPath := cfg.ReadingsCSVPath
	eventsCsvPath := cfg.EventsCSVPath

	if _, err := os.Stat(readingsCsvPath); err == nil {
		log.Println("Importing CSV data...")
		if err := importer.RunImport(db, readingsCsvPath, eventsCsvPath); err != nil {
			log.Printf("Warning during CSV import: %v", err)
		} else {
			log.Println("CSV data imported successfully.")
		}
	} else {
		log.Println("CSV files not found at default paths, skipping auto-import.")
	}

	meterRepo := repository.NewMeterRepo(db)
	readingRepo := repository.NewReadingRepo(db)
	eventRepo := repository.NewEventRepo(db)
	anomalyRepo := repository.NewAnomalyRepo(db)

	aiProvider := ai.NewOpenAIProvider()
	energyService := services.NewEnergyService(meterRepo, readingRepo, eventRepo, anomalyRepo)
	analysisService := services.NewAnalysisService(db, meterRepo, readingRepo, eventRepo, anomalyRepo, aiProvider)

	dashboardHandler := handlers.NewDashboardHandler(energyService)
	meterHandler := handlers.NewMeterHandler(energyService)
	anomalyHandler := handlers.NewAnomalyHandler(energyService)
	aiHandler := handlers.NewAIHandler(analysisService)
	specHandler := handlers.NewSpecHandler()

	router := handlers.NewRouter(dashboardHandler, meterHandler, anomalyHandler, aiHandler, specHandler)

	log.Printf("Server starting on port %s...", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, router); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
