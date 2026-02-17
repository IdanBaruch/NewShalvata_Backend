import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum MoodLevel {
  VERY_LOW = 'very_low', // 😞 Very down/depressed
  LOW = 'low', // 😔 Down
  NEUTRAL = 'neutral', // 😐 Okay
  GOOD = 'good', // 🙂 Good
  VERY_GOOD = 'very_good', // 😊 Great
}

export enum EnergyLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

@Entity('mood_logs')
export class MoodLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: MoodLevel,
  })
  mood: MoodLevel;

  @Column({
    type: 'enum',
    enum: EnergyLevel,
    nullable: true,
  })
  energy: EnergyLevel;

  @Column({ type: 'int', nullable: true })
  anxietyLevel: number; // 1-10 scale

  @Column({ type: 'int', nullable: true })
  sleepQuality: number; // 1-10 scale

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  symptoms: string[]; // e.g., ["racing_thoughts", "irritability", "social_withdrawal"]

  @Column({ default: false })
  suicidalThoughts: boolean; // Critical flag for clinician alerts

  @Column({ default: false })
  flaggedForReview: boolean;

  @ManyToOne(() => User, (user) => user.moodLogs)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
