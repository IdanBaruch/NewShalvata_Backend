import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { MedicationLog } from './medication-log.entity';

export enum MedicationFrequency {
  DAILY_ONCE = 'daily_once',
  DAILY_TWICE = 'daily_twice',
  DAILY_THREE = 'daily_three',
  WEEKLY = 'weekly',
  AS_NEEDED = 'as_needed',
}

@Entity('medications')
export class Medication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  dosage: string; // e.g., "10mg", "200mg"

  @Column({
    type: 'enum',
    enum: MedicationFrequency,
    default: MedicationFrequency.DAILY_ONCE,
  })
  frequency: MedicationFrequency;

  @Column({ type: 'time', array: true })
  scheduledTimes: string[]; // e.g., ["08:00", "20:00"]

  @Column({ nullable: true })
  notes: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.medications)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => MedicationLog, (log) => log.medication)
  logs: MedicationLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
