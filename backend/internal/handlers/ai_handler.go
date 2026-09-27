package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"github.com/biaenergy/energy-ai-backend/internal/services"
)

type AIHandler struct {
	analysisService *services.AnalysisService
}

func NewAIHandler(as *services.AnalysisService) *AIHandler {
	return &AIHandler{analysisService: as}
}

func (h *AIHandler) Analyze(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		MeterID string `json:"meter_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.MeterID == "" {
		http.Error(w, "Invalid request body: meter_id required", http.StatusBadRequest)
		return
	}

	analysisID, err := h.analysisService.StartAnalysis(r.Context(), req.MeterID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"analysis_id": analysisID,
		"status":      "PENDING",
		"meter_id":    req.MeterID,
	})
}

func (h *AIHandler) GetAnalysis(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/v1/ai/analysis/"), "/")
	if len(parts) == 0 || parts[0] == "" {
		http.Error(w, "Invalid analysis ID", http.StatusBadRequest)
		return
	}

	id, err := strconv.ParseInt(parts[0], 10, 64)
	if err != nil {
		http.Error(w, "Invalid analysis ID format", http.StatusBadRequest)
		return
	}

	analysis, err := h.analysisService.GetAnalysis(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if analysis == nil {
		http.Error(w, "Analysis not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(analysis)
}
