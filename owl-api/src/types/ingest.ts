export type SensorTypeKey =
  | 'window'
  | 'temperature'
  | 'humidity'
  | 'air_quality';

export interface IngestReadingItem {
  sensor_name: string;
  type: SensorTypeKey;
  value: number | boolean | string; // Le hub peut envoyer "1", 1, true, "Ouvert"...
  timestamp?: string; // Optionnel, format ISO 8601
}

export interface IngestPayload {
  hub_serial: string;
  readings: IngestReadingItem[];
}

export interface ProvisionPayload {
  hub_serial: string;
  email: string;
}