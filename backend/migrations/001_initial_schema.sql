CREATE TABLE IF NOT EXISTS meters (
    id SERIAL PRIMARY KEY,
    meter_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255),
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS readings (
    id SERIAL PRIMARY KEY,
    meter_id VARCHAR(50) NOT NULL REFERENCES meters(meter_id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    consumption_kwh DOUBLE PRECISION NOT NULL,
    voltage_v DOUBLE PRECISION NOT NULL,
    current_a DOUBLE PRECISION NOT NULL,
    power_factor DOUBLE PRECISION NOT NULL,
    status VARCHAR(50) DEFAULT 'OK',
    CONSTRAINT idx_meter_timestamp_unique UNIQUE (meter_id, timestamp)
);

CREATE INDEX IF NOT EXISTS idx_readings_meter_time ON readings(meter_id, timestamp);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    meter_id VARCHAR(50) NOT NULL REFERENCES meters(meter_id),
    event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS anomalies (
    id SERIAL PRIMARY KEY,
    meter_id VARCHAR(50) NOT NULL REFERENCES meters(meter_id),
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    variation_percent DOUBLE PRECISION NOT NULL,
    baseline DOUBLE PRECISION NOT NULL,
    consumption DOUBLE PRECISION NOT NULL,
    reason TEXT,
    recommended_action TEXT,
    status VARCHAR(50) DEFAULT 'OPEN',
    evidence JSONB,
    known_events JSONB
);

CREATE TABLE IF NOT EXISTS ai_analyses (
    id SERIAL PRIMARY KEY,
    meter_id VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
