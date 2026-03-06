import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Salon } from '../../salons/entities/salon.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // One user can have many appointments
  @OneToMany(() => Appointment, (appointment) => appointment.user)
  appointments: Appointment[];

  // Many users can have visited many salons
  @ManyToMany(() => Salon, (salon) => salon.users)
  previousSalons: Salon[];
}
