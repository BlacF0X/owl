import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Sensor } from './Sensor.js';

@Entity('sensortypes') // Le nom de la table est souvent au pluriel
export class SensorType {
  @PrimaryGeneratedColumn() // Correspond à SERIAL PRIMARY KEY
  sensor_type_id!: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  type_key!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 20 })
  unit!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  min_threshold!: number | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  max_threshold!: number | null;

  // Relation : Un SensorType peut avoir plusieurs Sensors
  @OneToMany('Sensor', (sensor: Sensor) => sensor.sensorType)
  sensors!: Sensor[];
}