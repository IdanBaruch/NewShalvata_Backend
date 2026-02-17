import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User, UserRole } from '../users/user.entity';
import { MedicationLog, VerificationStatus } from '../medications/medication-log.entity';
import { MoodLog } from '../mood/mood-log.entity';

export interface PatientAlert {
  patient: {
    id: string;
    name: string;
    phone: string;
  };
  alerts: {
    type: 'medication' | 'mood' | 'suicidal';
    severity: 'low' | 'medium' | 'high';
    message: string;
    timestamp: Date;
  }[];
  adherenceRate: number;
  lastMoodCheck: Date;
  daysSinceMedication: number;
}

@Injectable()
export class ClinicianService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(MedicationLog)
    private medicationLogsRepository: Repository<MedicationLog>,
    @InjectRepository(MoodLog)
    private moodLogsRepository: Repository<MoodLog>,
  ) {}

  /**
   * Get patients assigned to clinician with alert status
   */
  async getPatientAlerts(clinicianId: string): Promise<PatientAlert[]> {
    // Get all patients assigned to this clinician
    const patients = await this.usersRepository.find({
      where: {
        assignedClinicianId: clinicianId,
        role: UserRole.PATIENT,
      },
    });

    const alerts: PatientAlert[] = [];

    for (const patient of patients) {
      const patientAlerts = await this.analyzePatient(patient);
      if (patientAlerts.alerts.length > 0 || patientAlerts.adherenceRate < 70) {
        alerts.push(patientAlerts);
      }
    }

    // Sort by severity
    return alerts.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      const maxSeverityA = Math.max(...a.alerts.map(alert => severityOrder[alert.severity]));
      const maxSeverityB = Math.max(...b.alerts.map(alert => severityOrder[alert.severity]));
      return maxSeverityB - maxSeverityA;
    });
  }

  /**
   * Analyze single patient for alerts
   */
  private async analyzePatient(patient: User): Promise<PatientAlert> {
    const alerts: PatientAlert['alerts'] = [];
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    // Check medication adherence
    const medLogs = await this.medicationLogsRepository.find({
      where: {
        userId: patient.id,
        takenAt: Between(last7Days, new Date()),
      },
    });

    const verifiedCount = medLogs.filter(log => log.status === VerificationStatus.VERIFIED).length;
    const adherenceRate = medLogs.length > 0 ? (verifiedCount / medLogs.length) * 100 : 0;

    // Check days since last medication
    const lastMedLog = await this.medicationLogsRepository.findOne({
      where: { userId: patient.id, status: VerificationStatus.VERIFIED },
      order: { takenAt: 'DESC' },
    });

    const daysSinceMed = lastMedLog
      ? Math.floor((Date.now() - lastMedLog.takenAt.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    if (daysSinceMed > 2) {
      alerts.push({
        type: 'medication',
        severity: daysSinceMed > 7 ? 'high' : daysSinceMed > 3 ? 'medium' : 'low',
        message: `No medication taken for ${daysSinceMed} days`,
        timestamp: lastMedLog?.takenAt || new Date(),
      });
    }

    if (adherenceRate < 70 && adherenceRate > 0) {
      alerts.push({
        type: 'medication',
        severity: adherenceRate < 50 ? 'high' : 'medium',
        message: `Low adherence rate: ${adherenceRate.toFixed(0)}%`,
        timestamp: new Date(),
      });
    }

    // Check mood logs
    const moodLogs = await this.moodLogsRepository.find({
      where: { userId: patient.id },
      order: { createdAt: 'DESC' },
      take: 7,
    });

    const lastMoodLog = moodLogs[0];
    const flaggedMoods = moodLogs.filter(log => log.flaggedForReview);

    if (flaggedMoods.length > 0) {
      const suicidalLog = flaggedMoods.find(log => log.suicidalThoughts);
      if (suicidalLog) {
        alerts.push({
          type: 'suicidal',
          severity: 'high',
          message: 'Reported suicidal thoughts',
          timestamp: suicidalLog.createdAt,
        });
      }

      if (flaggedMoods.length >= 3) {
        alerts.push({
          type: 'mood',
          severity: 'medium',
          message: `${flaggedMoods.length} concerning mood entries in past week`,
          timestamp: flaggedMoods[0].createdAt,
        });
      }
    }

    return {
      patient: {
        id: patient.id,
        name: `${patient.firstName} ${patient.lastName}`,
        phone: patient.phone,
      },
      alerts,
      adherenceRate,
      lastMoodCheck: lastMoodLog?.createdAt || null,
      daysSinceMedication: daysSinceMed,
    };
  }

  /**
   * Get detailed patient report
   */
  async getPatientReport(patientId: string, days = 30) {
    const patient = await this.usersRepository.findOne({
      where: { id: patientId },
    });

    if (!patient) {
      throw new Error('Patient not found');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [medLogs, moodLogs] = await Promise.all([
      this.medicationLogsRepository.find({
        where: {
          userId: patientId,
          takenAt: Between(startDate, new Date()),
        },
        order: { takenAt: 'DESC' },
        relations: ['medication'],
      }),
      this.moodLogsRepository.find({
        where: {
          userId: patientId,
          createdAt: Between(startDate, new Date()),
        },
        order: { createdAt: 'DESC' },
      }),
    ]);

    return {
      patient: {
        id: patient.id,
        name: `${patient.firstName} ${patient.lastName}`,
        phone: patient.phone,
        email: patient.email,
      },
      medications: medLogs,
      moods: moodLogs,
      summary: {
        totalMedications: medLogs.length,
        verifiedMedications: medLogs.filter(log => log.status === VerificationStatus.VERIFIED).length,
        adherenceRate: medLogs.length > 0
          ? (medLogs.filter(log => log.status === VerificationStatus.VERIFIED).length / medLogs.length) * 100
          : 0,
        flaggedMoods: moodLogs.filter(log => log.flaggedForReview).length,
      },
    };
  }
}
