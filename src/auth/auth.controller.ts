import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SendMagicLinkDto, VerifyMagicLinkDto, AuthResponseDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('send-magic-link')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send magic link token',
    description: 'Sends a 6-digit code via SMS to the provided phone number for passwordless login',
  })
  @ApiResponse({
    status: 200,
    description: 'Magic link sent successfully',
  })
  async sendMagicLink(@Body() dto: SendMagicLinkDto) {
    return this.authService.sendMagicLink(dto.phone, dto.email);
  }

  @Post('verify-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify magic link token',
    description: 'Verifies the 6-digit code and returns a JWT access token',
  })
  @ApiResponse({
    status: 200,
    description: 'Token verified, JWT returned',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired token',
  })
  async verifyToken(@Body() dto: VerifyMagicLinkDto) {
    return this.authService.verifyMagicLink(dto.token);
  }
}
