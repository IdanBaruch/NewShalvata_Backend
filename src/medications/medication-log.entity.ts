import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Medication } from './medication.entity';

export enum VerificationStatus {
  VERIFIED = 'verified',
  PENDING = 'pending',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

@Entity('medication_logs')
export class MedicationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  medicationId: string;

  @Column({ type: 'timestamp' })
  takenAt: Date;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  status: VerificationStatus;

  @Column({ nullable: true })
  imageUrl: string; // S3 URL of the medication photo

  @Column({ type: 'jsonb', nullable: true })
  aiVerification: {
    confidence: number;
    detected: string[];
    reasoning: string;
    model: string; // e.g., "claude-3-sonnet-20240229"
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    latitude?: number;
    longitude?: number;
    deviceInfo?: string;
  };

  @Column({ default: 0 })
  streakCount: number; // Current consecutive days streak

  @ManyToOne(() => User, (user) => user.medicationLogs)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Medication, (medication) => medication.logs)
  @JoinColumn({ name: 'medicationId' })
  medication: Medication;

  @CreateDateColumn()
  createdAt: Date;
}
