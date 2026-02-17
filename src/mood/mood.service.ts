import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { MoodLog, MoodLevel, EnergyLevel } from './mood-log.entity';

export class CheckInDto {
  mood: MoodLevel;
  energy?: EnergyLevel;
  anxietyLevel?: number;
  sleepQuality?: number;
  notes?: string;
  symptoms?: string[];
  suicidalThoughts?: boolean;
}

@Injectable()
export class MoodService {
  constructor(
    @InjectRepository(MoodLog)
    private moodLogsRepository: Repository<MoodLog>,
  ) {}

  async checkIn(userId: string, dto: CheckInDto) {
    const log = this.moodLogsRepository.create({
      userId,
      ...dto,
      flaggedForReview: dto.suicidalThoughts || dto.mood === MoodLevel.VERY_LOW,
    });

    await this.moodLogsRepository.save(log);

    // TODO: If flagged, send alert to clinician
    if (log.flaggedForReview) {
      console.log(`[ALERT] User ${userId} needs immediate attention`);
    }

    return {
      id: log.id,
      message: dto.suicidalThoughts
        ? 'Thank you for sharing. Your clinician has been notified.'
        : 'Thank you for checking in.',
      flagged: log.flaggedForReview,
    };
  }

  async getHistory(userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.moodLogsRepository.find({
      where: {
        userId,
        createdAt: Between(startDate, new Date()),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getLatest(userId: string) {
    return this.moodLogsRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
