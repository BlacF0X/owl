-- =================================================================
-- Script de génération de données de test AVANCÉ pour le projet OwL
--
-- Objectifs :
-- 1. Créer 5 capteurs de chaque type par Hub.
-- 2. Générer 7 jours de lectures toutes les 30 mins pour les capteurs numériques.
-- 3. Générer des événements d'ouverture/fermeture aléatoires pour les capteurs de fenêtre.
-- 4. SYNCHRONISER l'état final dans la table Sensors (Correction demandée).
--
-- ATTENTION : Ce script supprime d'abord toutes les données existantes.
-- =================================================================

-- Nettoyage complet des tables pour une réinitialisation propre
TRUNCATE TABLE SensorReadings, Sensors, Hubs, Users RESTART IDENTITY CASCADE;

DO $$
DECLARE
    -- IDs de base
    v_user_id users.clerk_user_id%TYPE;
    v_hub_maison_id hubs.hub_id%TYPE;
    v_hub_bureau_id hubs.hub_id%TYPE;
    
    -- IDs des types de capteurs
    v_type_window_id sensortypes.sensor_type_id%TYPE;
    v_type_temp_id sensortypes.sensor_type_id%TYPE;
    v_type_humidity_id sensortypes.sensor_type_id%TYPE;
    v_type_air_quality_id sensortypes.sensor_type_id%TYPE;

    -- Variable de boucle
    i INT;
    
    -- Variables pour la génération des lectures de fenêtre
    window_sensor_ids UUID[];
    random_sensor_id UUID;
    last_state BOOLEAN;
    event_timestamp TIMESTAMPTZ;

BEGIN
    -- =================================================================
    -- ÉTAPE 1: Création des entités de base
    -- =================================================================
    
    INSERT INTO Users (clerk_user_id, first_name, email) VALUES ('user_35Pw4AlTEogwqj4o9mEeLkeC2Xe', 'Team OwL', 'team.owl.project@proton.me') RETURNING clerk_user_id INTO v_user_id;
    INSERT INTO Hubs (user_id, name, serial_number, status) VALUES (v_user_id, 'Maison Principale', 'OWL-HUB-001-MAISON', 'online') RETURNING hub_id INTO v_hub_maison_id;
    INSERT INTO Hubs (user_id, name, serial_number, status) VALUES (v_user_id, 'Bureau', 'OWL-HUB-002-BUREAU', 'online') RETURNING hub_id INTO v_hub_bureau_id;

    SELECT sensor_type_id INTO v_type_window_id FROM SensorTypes WHERE type_key = 'window';
    SELECT sensor_type_id INTO v_type_temp_id FROM SensorTypes WHERE type_key = 'temperature';
    SELECT sensor_type_id INTO v_type_humidity_id FROM SensorTypes WHERE type_key = 'humidity';
    SELECT sensor_type_id INTO v_type_air_quality_id FROM SensorTypes WHERE type_key = 'air_quality';

    RAISE NOTICE '✅ Entités de base (Utilisateur, Hubs) créées.';

    -- =================================================================
    -- ÉTAPE 2: Création de 5 capteurs de chaque type par Hub
    -- (Initialisés à NULL pour l'instant, on les mettra à jour à l'étape 5)
    -- =================================================================
    RAISE NOTICE '-> Création des capteurs...';
    FOR i IN 1..5 LOOP
        -- Capteurs pour le Hub "Maison"
        INSERT INTO Sensors (hub_id, sensor_type_id, name) VALUES (v_hub_maison_id, v_type_window_id, 'Fenêtre Maison ' || i);
        INSERT INTO Sensors (hub_id, sensor_type_id, name) VALUES (v_hub_maison_id, v_type_temp_id, 'Thermostat Maison ' || i);
        INSERT INTO Sensors (hub_id, sensor_type_id, name) VALUES (v_hub_maison_id, v_type_humidity_id, 'Humidité Maison ' || i);
        INSERT INTO Sensors (hub_id, sensor_type_id, name) VALUES (v_hub_maison_id, v_type_air_quality_id, 'Qualité Air Maison ' || i);

        -- Capteurs pour le Hub "Bureau"
        INSERT INTO Sensors (hub_id, sensor_type_id, name) VALUES (v_hub_bureau_id, v_type_window_id, 'Fenêtre Bureau ' || i);
        INSERT INTO Sensors (hub_id, sensor_type_id, name) VALUES (v_hub_bureau_id, v_type_temp_id, 'Thermostat Bureau ' || i);
        INSERT INTO Sensors (hub_id, sensor_type_id, name) VALUES (v_hub_bureau_id, v_type_humidity_id, 'Humidité Bureau ' || i);
        INSERT INTO Sensors (hub_id, sensor_type_id, name) VALUES (v_hub_bureau_id, v_type_air_quality_id, 'Qualité Air Bureau ' || i);
    END LOOP;
    RAISE NOTICE '✅ 40 capteurs créés.';

    -- =================================================================
    -- ÉTAPE 3: Génération de l'historique pour les capteurs NUMÉRIQUES
    -- =================================================================
    RAISE NOTICE '-> Génération de l''historique pour les capteurs numériques...';
    INSERT INTO SensorReadings (sensor_id, timestamp, value_num)
    SELECT
        s.sensor_id,
        ts,
        CASE st.type_key
            WHEN 'temperature' THEN ROUND((20 + (3 * sin(EXTRACT(HOUR FROM ts) * pi() / 12)) + (random() - 0.5))::numeric, 1)
            WHEN 'humidity' THEN ROUND((50 - (10 * sin(EXTRACT(HOUR FROM ts) * pi() / 12)) + (random() * 5 - 2.5))::numeric, 1)
            WHEN 'air_quality' THEN
                CASE
                    WHEN EXTRACT(ISODOW FROM ts) < 6 AND EXTRACT(HOUR FROM ts) BETWEEN 8 AND 18
                    THEN FLOOR(700 + random() * 500)
                    ELSE FLOOR(400 + random() * 200)
                END
        END
    FROM generate_series(NOW() - INTERVAL '7 days', NOW(), INTERVAL '30 minutes') AS ts
    CROSS JOIN sensors s
    JOIN sensortypes st ON s.sensor_type_id = st.sensor_type_id
    WHERE st.type_key != 'window';

    RAISE NOTICE '✅ Historique numérique généré.';

    -- =================================================================
    -- ÉTAPE 4: Génération de l'historique pour les capteurs de FENÊTRE
    -- =================================================================
    RAISE NOTICE '-> Génération de l''historique pour les capteurs de fenêtre...';
    SELECT array_agg(sensor_id) INTO window_sensor_ids FROM Sensors WHERE sensor_type_id = v_type_window_id;

    FOR i IN 1..500 LOOP
        random_sensor_id := window_sensor_ids[1 + floor(random() * array_length(window_sensor_ids, 1))];
        event_timestamp := NOW() - (random() * INTERVAL '7 days');

        SELECT value_bool INTO last_state
        FROM SensorReadings
        WHERE sensor_id = random_sensor_id
        ORDER BY timestamp DESC
        LIMIT 1;

        INSERT INTO SensorReadings (sensor_id, timestamp, value_bool)
        VALUES (random_sensor_id, event_timestamp, COALESCE(NOT last_state, random() > 0.5));
    END LOOP;
    RAISE NOTICE '✅ Historique fenêtre généré.';

    -- =================================================================
    -- ÉTAPE 5 (NOUVEAU): Synchronisation de l'état actuel dans Sensors
    -- =================================================================
    RAISE NOTICE '-> Synchronisation de l''état final des capteurs...';

    -- Mise à jour des capteurs avec leur toute dernière lecture connue
    -- On utilise une sous-requête corrélée pour trouver la lecture la plus récente
    UPDATE Sensors s
    SET 
        current_state_bool = sr.value_bool,
        current_state_num = sr.value_num,
        state_changed_at = sr.timestamp
    FROM (
        -- Cette requête complexe sélectionne la ligne la plus récente pour chaque sensor_id
        SELECT DISTINCT ON (sensor_id) sensor_id, value_bool, value_num, timestamp
        FROM SensorReadings
        ORDER BY sensor_id, timestamp DESC
    ) sr
    WHERE s.sensor_id = sr.sensor_id;

    RAISE NOTICE '✅ Synchronisation terminée.';
    RAISE NOTICE '🎉 Toutes les données de test ont été générées avec succès !';

END $$;