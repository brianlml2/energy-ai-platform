# AI Energy Management Platform - Go Backend

A production-oriented SaaS backend built in Go for energy management, anomaly detection, AI explainability, and operational decision-making.

## Features

- **REST API Contract**: Complete endpoints for Dashboard summary, Meters, Meter readings, Anomalies, and AI Analysis lifecycle.
- **Deterministic Analytics Engine**: Rule-based detection and classification of anomalies (`REAL_ANOMALY`, `EXPLAINABLE_ANOMALY`, `FALSE_POSITIVE`, `DATA_QUALITY`), covering expected cases **M-109**, **M-104**, **M-106**, and **M-112**.
- **Event Correlation**: Automatically correlates readings with operational events from `events.csv`.
- **AI Explainability Layer**: Integrates with LLM providers (OpenAI API with deterministic fallback) to generate grounded operational explanations and recommended actions.
- **PostgreSQL Persistence**: Embedded migrations and robust CSV data importer for `readings.csv` and `events.csv`.
- **Unit Testing**: Comprehensive test suite for analytics and classification rules.

---

## Project Structure

```
backend/
├── cmd/
│   └── server/
│       ├── main.go          # Application entrypoint
│       └── config.go        # Configuration loader
├── internal/
│   ├── ai/                  # AI provider abstraction & OpenAI client
│   ├── analytics/           # Baseline calculation, variation & classification engine
│   ├── domain/              # Domain models & entities
│   ├── handlers/            # HTTP handlers, router, and CORS middleware
│   ├── importer/            # CSV import logic for readings and events
│   ├── repository/          # PostgreSQL repositories & embedded migrations
│   ├── services/            # Business logic & analysis lifecycle services
│   └── utils/               # Shared CSV import and timestamp parsing utilities
├── data/                    # Dataset CSV files (readings.csv, events.csv)
├── migrations/              # SQL migration files
├── go.mod
├── go.sum
└── README.md
```

---

## Getting Started

### Prerequisites

- Go 1.21+
- PostgreSQL database

### Environment Variables

Configure the following environment variables (or rely on defaults for local development):

- `DATABASE_URL`: PostgreSQL connection string (default: `postgres://postgres:postgres@localhost:5432/energy_ai?sslmode=disable`)
- `PORT`: HTTP server port (default: `8080`)
- `OPENAI_API_KEY`: API key for OpenAI LLM provider (optional; falls back to robust local simulation if omitted)
- `READINGS_CSV_PATH`: Path to readings CSV file (default: `./data/readings.csv`)
- `EVENTS_CSV_PATH`: Path to events CSV file (default: `./data/events.csv`)

### Running with Docker

```bash
docker build -t energy-ai-backend .
docker run -p 8080:8080 -e DATABASE_URL="postgres://user:pass@host:5432/db?sslmode=disable" energy-ai-backend
```

```bash
go run ./cmd/server/main.go
```

### Running Tests

```bash
go test -v ./...
```

---

## API Contract (OpenAPI / Swagger)

The complete API specification, including schemas, enums (`AnomalyType`, `SeverityLevel`, `AnalysisStatus`), and endpoint definitions, is available in [openapi.yml](./openapi.yml). Frontend clients can use OpenAPI tools (such as `openapi-generator` or `swagger-typescript-api`) to automatically generate TypeScript types from this file.

- `GET /api/v1/dashboard/summary` - Summary metrics (total meters, active anomalies, high severity)
- `GET /api/v1/meters` - List all meters
- `GET /api/v1/meters/:meterId` - Get meter details
- `GET /api/v1/meters/:meterId/readings` - Get readings for a meter
- `GET /api/v1/anomalies` - List detected anomalies
- `GET /api/v1/anomalies/:id` - Get anomaly detail
- `POST /api/v1/ai/analyze` - Trigger AI analysis for a meter (`{ "meter_id": "M-109" }`)
- `GET /api/v1/ai/analysis/:id` - Get analysis status and result
