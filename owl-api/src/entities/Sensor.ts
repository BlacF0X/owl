import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Hub } from './Hub.js';
import { SensorType } from './SensorType.js';
import { SensorReading } from './SensorReading.js';

@Entity('sensors')
export class Sensor {
  @PrimaryGeneratedColumn('uuid')
  sensor_id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'boolean', nullable: true })
  current_state_bool!: boolean | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  current_state_num!: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  state_changed_at!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  // Relation : Plusieurs Sensors appartiennent à un Hub
  @ManyToOne('Hub', (hub: Hub) => hub.sensors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hub_id' })
  hub!: Hub;

  // Relation : Plusieurs Sensors sont d'un certain SensorType
  @ManyToOne('SensorType', (sensorType: SensorType) => sensorType.sensors)
  @JoinColumn({ name: 'sensor_type_id' })
  sensorType!: SensorType;

  // Relation : Un Sensor peut avoir plusieurs SensorReadings
  @OneToMany('SensorReading', (reading: SensorReading) => reading.sensor)
  readings!: SensorReading[];
}