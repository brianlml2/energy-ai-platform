package handlers

import (
	"net/http"
	"github.com/biaenergy/energy-ai-backend/internal/spec"
)

type SpecHandler struct{}

func NewSpecHandler() *SpecHandler {
	return &SpecHandler{}
}

func (h *SpecHandler) GetSpec(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/yaml")
	w.Header().Set("Content-Disposition", `attachment; filename="openapi.yml"`)
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(spec.OpenAPIYaml)
}
