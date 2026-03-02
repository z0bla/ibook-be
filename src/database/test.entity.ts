import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('test')
export class TestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;
}
