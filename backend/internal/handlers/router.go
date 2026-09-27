package handlers

import (
	"log"
	"net/http"
)

func NewRouter(
	dashboardHandler *DashboardHandler,
	meterHandler *MeterHandler,
	anomalyHandler *AnomalyHandler,
	aiHandler *AIHandler,
	specHandler *SpecHandler,
) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/v1/dashboard/summary", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w, r)
		if r.Method == http.MethodOptions {
			return
		}
		dashboardHandler.GetSummary(w, r)
	})

	mux.HandleFunc("/api/v1/meters", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w, r)
		if r.Method == http.MethodOptions {
			return
		}
		meterHandler.GetMeters(w, r)
	})

	mux.HandleFunc("/api/v1/meters/", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w, r)
		if r.Method == http.MethodOptions {
			return
		}
		meterHandler.GetMeterDetail(w, r)
	})

	mux.HandleFunc("/api/v1/anomalies", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w, r)
		if r.Method == http.MethodOptions {
			return
		}
		anomalyHandler.GetAnomalies(w, r)
	})

	mux.HandleFunc("/api/v1/anomalies/", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w, r)
		if r.Method == http.MethodOptions {
			return
		}
		anomalyHandler.GetAnomalyDetail(w, r)
	})

	mux.HandleFunc("/api/v1/ai/analyze", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w, r)
		if r.Method == http.MethodOptions {
			return
		}
		aiHandler.Analyze(w, r)
	})

	mux.HandleFunc("/api/v1/ai/analysis/", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w, r)
		if r.Method == http.MethodOptions {
			return
		}
		aiHandler.GetAnalysis(w, r)
	})

	mux.HandleFunc("/api/v1/spec", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w, r)
		if r.Method == http.MethodOptions {
			return
		}
		specHandler.GetSpec(w, r)
	})

	return loggingMiddleware(mux)
}

func enableCORS(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("[%s] %s", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}
