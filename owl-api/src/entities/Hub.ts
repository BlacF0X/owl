import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User.js';
import { Sensor } from './Sensor.js';
import { HubStatus } from './types/hub-status.enum.js';

@Entity('hubs')
export class Hub {
  @PrimaryGeneratedColumn('uuid') // UUID auto-généré
  hub_id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  serial_number!: string;

  @Column({
    type: 'enum',
    enum: HubStatus,
    default: HubStatus.PENDING,
  })
  status!: HubStatus;

  @Column({ type: 'timestamptz', nullable: true })
  last_seen_at!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  // Relation : Plusieurs Hubs appartiennent à un User
  @ManyToOne('User', (user: User) => user.hubs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' }) // Spécifie le nom de la colonne de la clé étrangère
  user!: User;

  // Relation : Un Hub peut avoir plusieurs Sensors
  @OneToMany('Sensor', (sensor: Sensor) => sensor.hub)
  sensors!: Sensor[];
}