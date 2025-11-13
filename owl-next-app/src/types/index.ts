// Type pour les informations de base d'un type de capteur
export interface SensorType {
  type_key: 'window' | 'temperature' | 'humidity' | 'air_quality';
  name: string;
  unit: string;
}

// Type principal pour un capteur, tel que renvoyé par l'API
// C'est un mélange d'informations des tables Sensors et SensorTypes
export interface Sensor {
  sensor_id: string;
  hub_id: string;
  name: string;
  // La valeur de l'état est unifiée en une seule chaîne de caractères pour un affichage simple
  displayValue: string;
  // La date du dernier changement d'état
  state_changed_at: string | null;
  // Les informations sur le type de capteur sont imbriquées
  type: SensorType;
}
