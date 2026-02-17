import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicianController } from './clinician.controller';
import { ClinicianService } from './clinician.service';
import { User } from '../users/user.entity';
import { MedicationLog } from '../medications/medication-log.entity';
import { MoodLog } from '../mood/mood-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, MedicationLog, MoodLog])],
  controllers: [ClinicianController],
  providers: [ClinicianService],
})
export class ClinicianModule {}
