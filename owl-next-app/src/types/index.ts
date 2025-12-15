export interface SensorType {
  type_key: 'window' | 'temperature' | 'humidity' | 'air_quality';
  name: string;
  unit: string;
}

export interface HubInfo {
  hub_id: string;
  name: string;
}

export interface Sensor {
  sensor_id: string;
  hub: HubInfo;
  name: string;
  displayValue: string;
  state_changed_at: string | null;
  type: SensorType;
}

export interface SensorReading {
  reading_id: string;
  timestamp: string;
  value_bool: boolean | null;
  value_num: number | null;
}

export interface WindowActivityEvent {
  id: string;
  timestamp: string;
  state: 'Ouvert' | 'Fermé';
  sensorName: string;
  hubName: string;
}

export type HubStatus = 'online' | 'offline' | 'pending';

export interface Hub {
  hub_id: string;
  name: string;
  serial_number: string;
  status: HubStatus;
  last_seen_at: string | null; // Les dates arrivent en string (ISO 8601) depuis l'API JSON
  created_at: string;
}
