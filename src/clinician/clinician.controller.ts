import { Controller, Get, UseGuards, Req, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ClinicianService } from './clinician.service';

@ApiTags('clinician')
@Controller('api/v1/clinician')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClinicianController {
  constructor(private clinicianService: ClinicianService) {}

  @Get('patients/alerts')
  @ApiOperation({
    summary: 'Get patient alerts',
    description: 'Returns list of patients requiring attention, sorted by severity',
  })
  async getPatientAlerts(@Req() req) {
    return this.clinicianService.getPatientAlerts(req.user.id);
  }

  @Get('patients/:patientId/report')
  @ApiOperation({
    summary: 'Get detailed patient report',
    description: 'Returns comprehensive report for a specific patient',
  })
  async getPatientReport(
    @Param('patientId') patientId: string,
    @Query('days') days?: number,
  ) {
    return this.clinicianService.getPatientReport(patientId, days);
  }
}
