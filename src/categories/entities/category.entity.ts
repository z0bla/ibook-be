import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Salon } from '../../salons/entities/salon.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  icon: string; // icon name from React Native Paper

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  // One category can have many salons
  @OneToMany(() => Salon, (salon) => salon.category)
  salons: Salon[];
}
