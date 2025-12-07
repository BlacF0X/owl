export type RoomStatus = 'good' | 'medium' | 'bad';

export interface SensorType {
  type_key: string;
  name: string;
  unit: string;
}

export interface Sensor {
  sensor_id: string;
  hub_id: string;
  hub?: { name: string };
  name: string;
  displayValue: string;
  state_changed_at: string | null;
  type: SensorType;
}

export interface RoomData {
  id: string;
  name: string;
  value: number;
  status: RoomStatus;
  location: 'Maison' | 'Bureau';
}

export interface AlertData {
  room: string;
  message: string;
  time: string;
}

export interface EvolutionData {
  hour: string;
  height: number;
  ppm: number;
}

export interface SensorHistoryResponse {
  sensor: { sensor_id: string; name: string; type: SensorType };
  history: Array<{ timestamp: string; value: number | boolean }>;
}
