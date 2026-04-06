import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { OperatingHours } from '../../operating-hours/entities/operating-hours.entity';
import { Service } from '../../services/entities/service.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { User } from '../../users/entities/user.entity';

@Entity('salons')
export class Salon {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  address!: string;

  @Column()
  phone!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  rating!: number;

  @Column({ default: 0 })
  reviewCount!: number;

  @Column({ nullable: true })
  image!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Many salons belong to one category
  @ManyToOne(() => Category, (category) => category.salons)
  category!: Category;

  // One salon has many operating hours
  @OneToMany(() => OperatingHours, (operatingHours) => operatingHours.salon)
  operatingHours!: OperatingHours[];

  // One salon has many services
  @OneToMany(() => Service, (service) => service.salon)
  services!: Service[];

  // One salon has many appointments
  @OneToMany(() => Appointment, (appointment) => appointment.salon)
  appointments!: Appointment[];

  // Many users can have visited many salons
  @ManyToMany(() => User, (user) => user.previousSalons)
  @JoinTable()
  users!: User[];
}
