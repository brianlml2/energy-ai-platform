package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"github.com/biaenergy/energy-ai-backend/internal/services"
)

type MeterHandler struct {
	energyService *services.EnergyService
}

func NewMeterHandler(es *services.EnergyService) *MeterHandler {
	return &MeterHandler{energyService: es}
}

func (h *MeterHandler) GetMeters(w http.ResponseWriter, r *http.Request) {
	meters, err := h.energyService.GetMeters()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(meters)
}

func (h *MeterHandler) GetMeterDetail(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/v1/meters/"), "/")
	if len(parts) == 0 || parts[0] == "" {
		http.Error(w, "Invalid meter ID", http.StatusBadRequest)
		return
	}
	meterID := parts[0]

	// Check if requesting readings
	if len(parts) > 1 && parts[1] == "readings" {
		limit := 500 // Default to 500 to cover the full 14-day dataset (336 readings)
		if lStr := r.URL.Query().Get("limit"); lStr != "" {
			if l, err := strconv.Atoi(lStr); err == nil {
				limit = l
			}
		}
		readings, err := h.energyService.GetReadings(meterID, limit)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(readings)
		return
	}

	meter, err := h.energyService.GetMeter(meterID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if meter == nil {
		http.Error(w, "Meter not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(meter)
}
