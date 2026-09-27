package handlers

import (
	"encoding/json"
	"net/http"
	"github.com/biaenergy/energy-ai-backend/internal/services"
)

type DashboardHandler struct {
	energyService *services.EnergyService
}

func NewDashboardHandler(es *services.EnergyService) *DashboardHandler {
	return &DashboardHandler{energyService: es}
}

func (h *DashboardHandler) GetSummary(w http.ResponseWriter, r *http.Request) {
	summary, err := h.energyService.GetDashboardSummary()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(summary)
}
