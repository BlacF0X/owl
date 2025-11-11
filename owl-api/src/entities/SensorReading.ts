import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Sensor } from './Sensor.js';

@Entity('sensorreadings')
export class SensorReading {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' }) // Correspond à BIGSERIAL
  reading_id!: string; // En JS, les big integers sont souvent gérés comme des strings pour éviter les pbs de précision

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  timestamp!: Date;

  @Column({ type: 'boolean', nullable: true })
  value_bool!: boolean | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  value_num!: number | null;

  // Relation : Plusieurs lectures appartiennent à un Sensor
  @ManyToOne('Sensor', (sensor: Sensor) => sensor.readings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sensor_id' })
  sensor!: Sensor;
}