import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Req() req) {
    return this.usersService.findById(req.user.id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(@Req() req, @Body() updates: any) {
    return this.usersService.updateProfile(req.user.id, updates);
  }

  @Put('fcm-token')
  @ApiOperation({ summary: 'Update FCM token for push notifications' })
  async updateFCMToken(@Req() req, @Body('token') token: string) {
    await this.usersService.updateFCMToken(req.user.id, token);
    return { message: 'FCM token updated' };
  }
}
