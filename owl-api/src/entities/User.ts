import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Hub } from './Hub.js';

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'varchar', length: 255 }) // Clé primaire non auto-générée
  clerk_user_id!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  first_name!: string | null;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @CreateDateColumn({ type: 'timestamptz' }) // Gère automatiquement la date de création
  created_at!: Date;

  // Relation : Un User peut avoir plusieurs Hubs
  @OneToMany('Hub', (hub: Hub) => hub.user)
  hubs!: Hub[];
}