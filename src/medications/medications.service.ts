import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { Medication } from './medication.entity';
import { MedicationLog, VerificationStatus } from './medication-log.entity';
import { User } from '../users/user.entity';
import { AiVisionService } from './ai-vision.service';
import { CreateMedicationDto } from './dto/medication.dto';

@Injectable()
export class MedicationsService {
  private s3: AWS.S3;

  constructor(
    @InjectRepository(Medication)
    private medicationsRepository: Repository<Medication>,
    @InjectRepository(MedicationLog)
    private logsRepository: Repository<MedicationLog>,
    private configService: ConfigService,
    private aiVisionService: AiVisionService,
  ) {
    this.s3 = new AWS.S3({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  /**
   * Get user's daily medication schedule
   */
  async getDailyPlan(userId: string) {
    const medications = await this.medicationsRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'ASC' },
    });

    // Get today's logs to show completion status
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayLogs = await this.logsRepository.find({
      where: {
        userId,
        takenAt: Between(startOfDay, endOfDay),
        status: VerificationStatus.VERIFIED,
      },
    });

    const logsByMed = todayLogs.reduce((acc, log) => {
      acc[log.medicationId] = log;
      return acc;
    }, {});

    return medications.map((med) => ({
      ...med,
      takenToday: !!logsByMed[med.id],
      lastTaken: logsByMed[med.id]?.takenAt,
    }));
  }

  /**
   * Create new medication schedule
   */
  async createMedication(userId: string, dto: CreateMedicationDto) {
    const medication = this.medicationsRepository.create({
      ...dto,
      userId,
    });
    return this.medicationsRepository.save(medication);
  }

  /**
   * Verify medication intake with image
   */
  async verifyIntake(
    userId: string,
    medicationId: string,
    imageBuffer: Buffer,
    metadata?: { latitude?: number; longitude?: number },
  ) {
    // Find medication
    const medication = await this.medicationsRepository.findOne({
      where: { id: medicationId, userId },
    });

    if (!medication) {
      throw new NotFoundException('Medication not found');
    }

    // Upload image to S3
    const imageKey = `medications/${userId}/${Date.now()}.jpg`;
    const imageUrl = await this.uploadToS3(imageKey, imageBuffer);

    // Verify with AI
    const imageBase64 = imageBuffer.toString('base64');
    const aiResult = await this.aiVisionService.verifyMedicationImage(
      imageBase64,
      medication.name,
    );

    // Calculate streak
    const streak = await this.calculateStreak(userId);

    // Create log
    const log = this.logsRepository.create({
      userId,
      medicationId,
      takenAt: new Date(),
      status: aiResult.isValid && aiResult.confidence > 70
        ? VerificationStatus.VERIFIED
        : VerificationStatus.FAILED,
      imageUrl,
      aiVerification: {
        confidence: aiResult.confidence,
        detected: aiResult.detected,
        reasoning: aiResult.reasoning,
        model: 'claude-3-5-sonnet-20241022',
      },
      metadata,
      streakCount: aiResult.isValid ? streak + 1 : 0,
    });

    await this.logsRepository.save(log);

    return {
      id: log.id,
      status: log.status,
      confidence: aiResult.confidence,
      streakCount: log.streakCount,
      message:
        log.status === VerificationStatus.VERIFIED
          ? `Great! ${streak + 1} day streak! 🔥`
          : 'Could not verify. Please try again.',
    };
  }

  /**
   * Calculate current streak
   */
  private async calculateStreak(userId: string): Promise<number> {
    const logs = await this.logsRepository.find({
      where: { userId, status: VerificationStatus.VERIFIED },
      order: { takenAt: 'DESC' },
      take: 365,
    });

    if (logs.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const log of logs) {
      const logDate = new Date(log.takenAt);
      logDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Upload image to S3
   */
  private async uploadToS3(key: string, buffer: Buffer): Promise<string> {
    const bucket = this.configService.get('AWS_S3_BUCKET');

    await this.s3
      .upload({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: 'image/jpeg',
        ServerSideEncryption: 'AES256',
      })
      .promise();

    return `https://${bucket}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`;
  }

  /**
   * Get medication history
   */
  async getHistory(userId: string, medicationId?: string, days = 30) {
    const where: any = { userId };
    if (medicationId) where.medicationId = medicationId;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.logsRepository.find({
      where: {
        ...where,
        takenAt: Between(startDate, new Date()),
      },
      order: { takenAt: 'DESC' },
      relations: ['medication'],
    });
  }
}
