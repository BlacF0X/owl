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
