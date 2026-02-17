import { Controller, Post, Get, Body, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MoodService, CheckInDto } from './mood.service';

@ApiTags('mood')
@Controller('api/v1/mood')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MoodController {
  constructor(private moodService: MoodService) {}

  @Post('check-in')
  @ApiOperation({
    summary: 'Daily mood check-in',
    description: 'Record daily mood, energy, and symptoms',
  })
  async checkIn(@Req() req, @Body() dto: CheckInDto) {
    return this.moodService.checkIn(req.user.id, dto);
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get mood history',
    description: 'Returns mood logs for the specified period',
  })
  async getHistory(@Req() req, @Query('days') days?: number) {
    return this.moodService.getHistory(req.user.id, days);
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get latest mood entry' })
  async getLatest(@Req() req) {
    return this.moodService.getLatest(req.user.id);
  }
}
