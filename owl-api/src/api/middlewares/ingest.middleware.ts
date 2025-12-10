import type { Request, Response, NextFunction } from 'express';
import { IngestPayload } from '../../types/ingest.js';

export const validateIngestPayload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body as IngestPayload;

  // 1. Vérification de la racine
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ message: 'Payload invalide ou manquant.' });
  }

  if (!payload.hub_serial || typeof payload.hub_serial !== 'string') {
    return res
      .status(400)
      .json({ message: 'Champ "hub_serial" manquant ou invalide.' });
  }

  if (!Array.isArray(payload.readings) || payload.readings.length === 0) {
    return res
      .status(400)
      .json({ message: 'Le tableau "readings" est vide ou invalide.' });
  }

  // 2. Vérification des items (sommaire)
  // On vérifie juste les champs obligatoires du premier niveau pour ne pas trop ralentir
  for (const [index, reading] of payload.readings.entries()) {
    if (!reading.sensor_name || typeof reading.sensor_name !== 'string') {
      return res.status(400).json({
        message: `Reading à l'index ${index} invalide : "sensor_name" requis.`,
      });
    }

    if (!reading.type || typeof reading.type !== 'string') {
      return res.status(400).json({
        message: `Reading à l'index ${index} invalide : "type" requis.`,
      });
    }

    if (reading.value === undefined || reading.value === null) {
      return res.status(400).json({
        message: `Reading à l'index ${index} invalide : "value" requise.`,
      });
    }
  }

  // Si tout est bon, on passe au contrôleur
  next();
};
