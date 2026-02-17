import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicationsController } from './medications.controller';
import { MedicationsService } from './medications.service';
import { AiVisionService } from './ai-vision.service';
import { Medication } from './medication.entity';
import { MedicationLog } from './medication-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Medication, MedicationLog])],
  controllers: [MedicationsController],
  providers: [MedicationsService, AiVisionService],
  exports: [MedicationsService],
})
export class MedicationsModule {}
