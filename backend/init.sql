-- =================================================================
-- Script de création de la base de données pour le projet OwL
-- Base de données cible : PostgreSQL
-- =================================================================

-- Suppression des tables existantes et du type ENUM pour une réinitialisation propre
DROP TABLE IF EXISTS SensorReadings;
DROP TABLE IF EXISTS Sensors;
DROP TABLE IF EXISTS Hubs;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS SensorTypes;
DROP TYPE IF EXISTS hub_status;

-- =================================================================
-- 1. Création des types personnalisés (ENUM)
-- =================================================================

-- Un type ENUM est plus robuste qu'un VARCHAR pour les statuts
CREATE TYPE hub_status AS ENUM ('online', 'offline', 'pending');

-- =================================================================
-- 2. Création des tables
-- =================================================================

-- Table de référence pour les types de capteurs
CREATE TABLE SensorTypes (
    sensor_type_id SERIAL PRIMARY KEY,
    type_key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) UNIQUE NOT NULL,
    unit VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    min_threshold DECIMAL(8, 2) NULL,
    max_threshold DECIMAL(8, 2) NULL
);

-- Table des utilisateurs, synchronisée avec Clerk
CREATE TABLE Users (
    clerk_user_id VARCHAR(255) PRIMARY KEY,
    first_name VARCHAR(100) NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table pour les boîtiers centraux (Hubs)
CREATE TABLE Hubs (
    hub_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL REFERENCES Users(clerk_user_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    status hub_status NOT NULL DEFAULT 'pending',
    last_seen_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table centrale pour tous les capteurs
CREATE TABLE Sensors (
    sensor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hub_id UUID NOT NULL REFERENCES Hubs(hub_id) ON DELETE CASCADE,
    sensor_type_id INTEGER NOT NULL REFERENCES SensorTypes(sensor_type_id),
    name VARCHAR(100) NOT NULL,
    current_state_bool BOOLEAN NULL,
    current_state_num DECIMAL(8, 2) NULL,
    state_changed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- La contrainte CHECK pour garantir l'exclusion mutuelle des états
    -- Un capteur ne peut avoir qu'un seul type de valeur d'état (bool ou num)
    -- Attention le capteur peut ne pas avoir de valeur du tout
    CONSTRAINT chk_sensor_state_exclusive CHECK (
        (current_state_bool IS NULL) OR (current_state_num IS NULL)
    )
);

-- Table (potentiellement très volumineuse) pour l'historique des lectures
CREATE TABLE SensorReadings (
    reading_id BIGSERIAL PRIMARY KEY,
    sensor_id UUID NOT NULL REFERENCES Sensors(sensor_id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    value_bool BOOLEAN NULL,
    value_num DECIMAL(8, 2) NULL,

    -- Contrainte CHECK pour l'exclusion mutuelle des valeurs de lecture
    CONSTRAINT chk_reading_value_exclusive CHECK (
        (value_bool IS NOT NULL AND value_num IS NULL) OR
        (value_bool IS NULL AND value_num IS NOT NULL)
    )
);

-- =================================================================
-- 3. Création des Index pour l'optimisation des performances
-- =================================================================

-- Index sur la clé étrangère de SensorReadings (très important pour les jointures)
CREATE INDEX idx_sensorreadings_sensor_id ON SensorReadings(sensor_id);

-- Index sur le timestamp pour accélérer les requêtes basées sur des plages de temps
CREATE INDEX idx_sensorreadings_timestamp ON SensorReadings(timestamp);


-- =================================================================
-- 4. Insertion de données de base (optionnel)
-- =================================================================
INSERT INTO SensorTypes (type_key, name, unit, description) VALUES
('window',      'Fenêtre',              '-',    'Détecte si une fenêtre est ouverte ou fermée.'),
('temperature', 'Température',          '°C',   'Mesure la température ambiante.'),
('humidity',    'Humidité',             '%',    'Mesure le taux d''humidité relative de l''air.'),
('air_quality', 'Qualité de l''air',    'ppm',  'Mesure la concentration de CO2 en parties par million.');

-- =================================================================
-- Fin du script
-- =================================================================
