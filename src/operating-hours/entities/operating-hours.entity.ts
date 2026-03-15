import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { Salon } from '../../salons/entities/salon.entity';
import { DayEnum } from '../../common/enums/day.enum';

@Entity('operating_hours')
export class OperatingHours {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: DayEnum })
  day: DayEnum;

  @Column({ type: 'time' })
  openTime: string;

  @Column({ type: 'time' })
  closeTime: string;

  @Column({ default: false })
  isClosed: boolean;

  @UpdateDateColumn()
  updatedAt: Date;

  // Many operating hours belong to one salon
  @ManyToOne(() => Salon, (salon) => salon.operatingHours)
  salon: Salon;
}
