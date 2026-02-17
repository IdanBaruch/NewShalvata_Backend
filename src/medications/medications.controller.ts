import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  Query,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import type { Multer } from 'multer';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MedicationsService } from './medications.service';
import { CreateMedicationDto, VerifyIntakeDto } from './dto/medication.dto';

@ApiTags('medications')
@Controller('api/v1/meds')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MedicationsController {
  constructor(private medicationsService: MedicationsService) {}

  @Get('daily-plan')
  @ApiOperation({
    summary: 'Get daily medication schedule',
    description: 'Returns all active medications for the user with completion status for today',
  })
  async getDailyPlan(@Req() req) {
    return this.medicationsService.getDailyPlan(req.user.id);
  }

  @Post()
  @ApiOperation({
    summary: 'Add new medication',
    description: 'Creates a new medication schedule for the user',
  })
  async createMedication(@Req() req, @Body() dto: CreateMedicationDto) {
    return this.medicationsService.createMedication(req.user.id, dto);
  }

  @Post('verify-intake')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Verify medication intake',
    description: 'Upload an image of medication being taken for AI verification',
  })
  @ApiBody({ type: VerifyIntakeDto })
  async verifyIntake(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('medicationId') medicationId: string,
    @Body('latitude') latitude?: number,
    @Body('longitude') longitude?: number,
  ) {
    return this.medicationsService.verifyIntake(
      req.user.id,
      medicationId,
      file.buffer,
      { latitude, longitude },
    );
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get medication history',
    description: 'Returns medication logs for the specified period',
  })
  async getHistory(
    @Req() req,
    @Query('medicationId') medicationId?: string,
    @Query('days') days?: number,
  ) {
    return this.medicationsService.getHistory(req.user.id, medicationId, days);
  }
}
