import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Salon } from '../../salons/entities/salon.entity';
import { Service } from '../../services/entities/service.entity';
import { AppointmentStatusEnum } from '../../common/enums/appointment-status.enum';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  appointmentDate!: Date;

  @Column({ type: 'time' })
  appointmentTime!: string;

  @Column()
  duration!: number; // copied from service

  @Column({
    type: 'enum',
    enum: AppointmentStatusEnum,
    default: AppointmentStatusEnum.BOOKED,
  })
  status!: AppointmentStatusEnum;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relationships

  @ManyToOne(() => User, (user) => user.appointments)
  user!: User;

  @ManyToOne(() => Salon, (salon) => salon.appointments)
  salon!: Salon;

  @ManyToOne(() => Service, (service) => service.appointments)
  service!: Service;
}
