import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Salon } from '../../salons/entities/salon.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  duration!: number; // in minutes

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  price!: number;

  @CreateDateColumn()
  createdAt!: Date;

  // Many services belong to one salon
  @ManyToOne(() => Salon, (salon) => salon.services)
  salon!: Salon;

  // One service can have many appointments
  @OneToMany(() => Appointment, (appointment) => appointment.service)
  appointments!: Appointment[];
}
