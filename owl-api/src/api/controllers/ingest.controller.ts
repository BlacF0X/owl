import type { Request, Response } from 'express';
import { AppDataSource } from '../../config/data-source.js';
import { Hub } from '../../entities/Hub.js';
import { Sensor } from '../../entities/Sensor.js';
import { SensorReading } from '../../entities/SensorReading.js';
import { SensorType } from '../../entities/SensorType.js';
import { IngestPayload, SensorTypeKey } from '../../types/ingest.js';

// --- HELPER : Normalisation ---
/**
 * Convertit la valeur brute entrante en format compatible BDD (exclusion mutuelle bool/num)
 */
const normalizeValue = (
  typeKey: SensorTypeKey,
  rawValue: string | number | boolean
): { valueBool: boolean | null; valueNum: number | null } => {
  // 1. Cas Fenêtre (Booléen)
  if (typeKey === 'window') {
    // On gère les cas "true", "1", 1, true, "Ouvert" comme TRUE (Ouvert)
    const isTrue =
      rawValue === true ||
      rawValue === 'true' ||
      rawValue === 1 ||
      rawValue === '1' ||
      (typeof rawValue === 'string' && rawValue.toLowerCase() === 'ouvert');

    return { valueBool: isTrue, valueNum: null };
  }

  // 2. Autres cas (Numérique : Temp, Hum, CO2)
  // On convertit en nombre flottant
  const num =
    typeof rawValue === 'string' ? parseFloat(rawValue) : Number(rawValue);

  // Si la conversion échoue (NaN), on renvoie null (ou 0 par défaut selon la stratégie)
  const safeNum = isNaN(num) ? null : num;

  return { valueBool: null, valueNum: safeNum };
};

// --- MAIN CONTROLLER ---

export const processIngest = async (req: Request, res: Response) => {
  const { hub_serial, readings } = req.body as IngestPayload;

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  // Démarrage de la transaction
  await queryRunner.startTransaction();

  try {
    // 1. Récupération du Hub
    const hub = await queryRunner.manager.findOne(Hub, {
      where: { serial_number: hub_serial },
      relations: ['user'], // On charge le user juste pour vérifier qu'il existe si besoin
    });

    if (!hub) {
      await queryRunner.rollbackTransaction();
      return res
        .status(404)
        .json({ message: `Hub introuvable : ${hub_serial}` });
    }

    // 2. Pré-chargement des données pour optimisation (Évite les requêtes dans la boucle)

    // a. Tous les types de capteurs (ex: window, temperature...)
    const allSensorTypes = await queryRunner.manager.find(SensorType);
    const sensorTypesMap = new Map(allSensorTypes.map((t) => [t.type_key, t]));

    // b. Tous les capteurs existants pour ce Hub
    const existingSensors = await queryRunner.manager.find(Sensor, {
      where: { hub: { hub_id: hub.hub_id } },
      relations: ['sensorType'],
    });
    // Map pour accès rapide par nom : "Salon Temp" -> Entity
    const sensorsMap = new Map(existingSensors.map((s) => [s.name, s]));

    // 3. Traitement des lectures
    const readingsToInsert: SensorReading[] = [];
    const sensorsToUpdate: Sensor[] = [];

    const now = new Date();

    for (const item of readings) {
      const sensorTypeEntity = sensorTypesMap.get(item.type);

      if (!sensorTypeEntity) {
        console.warn(`Type de capteur inconnu ignoré : ${item.type}`);
        continue;
      }

      // --- LOGIQUE AUTO-PROVISIONING ---
      let sensor = sensorsMap.get(item.sensor_name);

      if (!sensor) {
        // Création à la volée
        sensor = queryRunner.manager.create(Sensor, {
          name: item.sensor_name,
          hub: hub,
          sensorType: sensorTypeEntity,
          current_state_bool: null,
          current_state_num: null,
          state_changed_at: now, // Initialisation
        });

        // On doit sauvegarder immédiatement pour avoir un sensor_id pour les readings
        await queryRunner.manager.save(sensor);
        // On l'ajoute à la map pour ne pas le recréer si présent 2x dans le payload
        sensorsMap.set(sensor.name, sensor);
      }

      // --- NORMALISATION & DETECTION CHANGEMENT ---
      const { valueBool, valueNum } = normalizeValue(item.type, item.value);

      // Détection de changement d'état (pour mettre à jour state_changed_at)
      // On compare la nouvelle valeur avec l'ancienne stockée dans l'objet sensor
      const hasChangedBool =
        valueBool !== null && sensor.current_state_bool !== valueBool;
      // Pour les nombres, on peut tolérer une petite marge (epsilon) mais ici on fait simple
      const hasChangedNum =
        valueNum !== null && sensor.current_state_num !== valueNum;

      if (hasChangedBool || hasChangedNum) {
        sensor.state_changed_at = item.timestamp
          ? new Date(item.timestamp)
          : now;
      }

      // Mise à jour de l'état courant (en mémoire pour l'instant)
      sensor.current_state_bool = valueBool;
      sensor.current_state_num = valueNum;

      // On ajoute ce sensor à la liste des updates à faire
      // (Note: save() gère l'upsert, donc pas de souci si ajouté plusieurs fois, mais optimisons)
      if (!sensorsToUpdate.includes(sensor)) {
        sensorsToUpdate.push(sensor);
      }

      // --- CRÉATION HISTORIQUE ---
      const reading = queryRunner.manager.create(SensorReading, {
        sensor: sensor,
        timestamp: item.timestamp ? new Date(item.timestamp) : now,
        value_bool: valueBool,
        value_num: valueNum,
      });

      readingsToInsert.push(reading);
    }

    // 4. Persistance en base (Batch)

    // a. Mettre à jour les états actuels des capteurs
    if (sensorsToUpdate.length > 0) {
      await queryRunner.manager.save(sensorsToUpdate);
    }

    // b. Insérer l'historique
    if (readingsToInsert.length > 0) {
      await queryRunner.manager.save(readingsToInsert);
    }

    // c. Mettre à jour le "last_seen_at" du Hub
    hub.last_seen_at = now;
    await queryRunner.manager.save(hub);

    // Si tout s'est bien passé, on valide la transaction
    await queryRunner.commitTransaction();

    return res.status(201).json({
      message: 'Données traitées avec succès.',
      stats: {
        sensors_updated: sensorsToUpdate.length,
        readings_inserted: readingsToInsert.length,
      },
    });
  } catch (err) {
    // En cas d'erreur, on annule tout
    await queryRunner.rollbackTransaction();
    console.error('Erreur ingestion :', err);
    return res
      .status(500)
      .json({ message: "Erreur interne lors de l'ingestion." });
  } finally {
    // On libère la connexion
    await queryRunner.release();
  }
};
