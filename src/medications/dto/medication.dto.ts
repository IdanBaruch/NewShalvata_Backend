import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsArray, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { MedicationFrequency } from '../medication.entity';

export class CreateMedicationDto {
  @ApiProperty({ example: 'Lithium' })
  @IsString()
  name: string;

  @ApiProperty({ example: '300mg' })
  @IsString()
  dosage: string;

  @ApiProperty({ enum: MedicationFrequency, example: MedicationFrequency.DAILY_TWICE })
  @IsEnum(MedicationFrequency)
  frequency: MedicationFrequency;

  @ApiProperty({ example: ['08:00', '20:00'] })
  @IsArray()
  scheduledTimes: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  startDate: string;
}

export class VerifyIntakeDto {
  @ApiProperty({ format: 'binary', description: 'Image of medication being taken' })
  image: any;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  medicationId: string;

  @ApiProperty({ required: false, example: 32.0853 })
  @IsOptional()
  latitude?: number;

  @ApiProperty({ required: false, example: 34.7818 })
  @IsOptional()
  longitude?: number;
}

export class MedicationLogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  confidence: number;

  @ApiProperty()
  streakCount: number;

  @ApiProperty()
  message: string;
}
