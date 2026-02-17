import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Medication } from '../medications/medication.entity';
import { MedicationLog } from '../medications/medication-log.entity';
import { MoodLog } from '../mood/mood-log.entity';

export enum UserRole {
  PATIENT = 'patient',
  CLINICIAN = 'clinician',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ nullable: true })
  @Exclude()
  magicLinkToken: string;

  @Column({ type: 'timestamp', nullable: true })
  @Exclude()
  magicLinkExpires: Date;

  @Column({ nullable: true })
  fcmToken: string; // Firebase Cloud Messaging token for push notifications

  @Column({ type: 'uuid', nullable: true })
  assignedClinicianId: string; // The clinician assigned to this patient

  @Column({ type: 'jsonb', nullable: true })
  preferences: {
    notificationsEnabled: boolean;
    reminderTimes: string[]; // e.g., ["08:00", "20:00"]
    language: string;
  };

  @OneToMany(() => Medication, (medication) => medication.user)
  medications: Medication[];

  @OneToMany(() => MedicationLog, (log) => log.user)
  medicationLogs: MedicationLog[];

  @OneToMany(() => MoodLog, (log) => log.user)
  moodLogs: MoodLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;
}
