package services

import (
	"github.com/biaenergy/energy-ai-backend/internal/domain"
	"github.com/biaenergy/energy-ai-backend/internal/repository"
)

type EnergyService struct {
	meterRepo   *repository.MeterRepo
	readingRepo *repository.ReadingRepo
	eventRepo   *repository.EventRepo
	anomalyRepo *repository.AnomalyRepo
}

func NewEnergyService(meterRepo *repository.MeterRepo, readingRepo *repository.ReadingRepo, eventRepo *repository.EventRepo, anomalyRepo *repository.AnomalyRepo) *EnergyService {
	return &EnergyService{
		meterRepo:   meterRepo,
		readingRepo: readingRepo,
		eventRepo:   eventRepo,
		anomalyRepo: anomalyRepo,
	}
}

func (s *EnergyService) GetDashboardSummary() (domain.DashboardSummary, error) {
	meters, err := s.meterRepo.GetAll()
	if err != nil {
		return domain.DashboardSummary{}, err
	}

	anomalies, err := s.anomalyRepo.GetAll()
	if err != nil {
		return domain.DashboardSummary{}, err
	}

	totalConsumption, currentConsumption, prevConsumption, err := s.readingRepo.GetConsumptionStats()
	if err != nil {
		totalConsumption, currentConsumption, prevConsumption = 0, 0, 0
	}

	var changePercent float64
	if prevConsumption > 0 {
		changePercent = ((currentConsumption - prevConsumption) / prevConsumption) * 100
	}

	lastAnalysisAt, _ := s.anomalyRepo.GetLastAnalysisTime()

	activeCount := len(anomalies)
	highSeverity := 0
	dataQuality := 0
	for _, a := range anomalies {
		if a.Severity == domain.SeverityHigh {
			highSeverity++
		}
		if a.Type == domain.AnomalyTypeDataQuality {
			dataQuality++
		}
	}

	return domain.DashboardSummary{
		TotalMeters:              len(meters),
		ActiveAnomalies:          activeCount,
		HighSeverity:             highSeverity,
		DataQualityIssues:        dataQuality,
		TotalConsumption:         totalConsumption,
		ConsumptionChangePercent: changePercent,
		LastAnalysisAt:           lastAnalysisAt,
	}, nil
}

func (s *EnergyService) GetMeters() ([]domain.Meter, error) {
	return s.meterRepo.GetAll()
}

func (s *EnergyService) GetMeter(meterID string) (*domain.Meter, error) {
	return s.meterRepo.GetByMeterID(meterID)
}

func (s *EnergyService) GetReadings(meterID string, limit int) ([]domain.Reading, error) {
	return s.readingRepo.GetByMeterID(meterID, limit)
}

func (s *EnergyService) GetAnomalies() ([]domain.Anomaly, error) {
	return s.anomalyRepo.GetAll()
}

func (s *EnergyService) GetAnomaly(id int64) (*domain.Anomaly, error) {
	return s.anomalyRepo.GetByID(id)
}
