package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"github.com/biaenergy/energy-ai-backend/internal/domain"
	"github.com/biaenergy/energy-ai-backend/internal/services"
)

type AnomalyHandler struct {
	energyService *services.EnergyService
}

func NewAnomalyHandler(es *services.EnergyService) *AnomalyHandler {
	return &AnomalyHandler{energyService: es}
}

func (h *AnomalyHandler) GetAnomalies(w http.ResponseWriter, r *http.Request) {
	anomalies, err := h.energyService.GetAnomalies()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if anomalies == nil {
		anomalies = []domain.Anomaly{}
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(anomalies)
}

func (h *AnomalyHandler) GetAnomalyDetail(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/v1/anomalies/"), "/")
	if len(parts) == 0 || parts[0] == "" {
		http.Error(w, "Invalid anomaly ID", http.StatusBadRequest)
		return
	}

	id, err := strconv.ParseInt(parts[0], 10, 64)
	if err != nil {
		http.Error(w, "Invalid anomaly ID format", http.StatusBadRequest)
		return
	}

	anomaly, err := h.energyService.GetAnomaly(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if anomaly == nil {
		http.Error(w, "Anomaly not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(anomaly)
}
