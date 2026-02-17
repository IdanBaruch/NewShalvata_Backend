import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber, IsString, IsOptional, IsEmail } from 'class-validator';

export class SendMagicLinkDto {
  @ApiProperty({
    description: 'User phone number with country code',
    example: '+972501234567',
  })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({
    description: 'User email (optional)',
    example: 'user@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class VerifyMagicLinkDto {
  @ApiProperty({
    description: 'Magic link token from SMS/Email',
    example: 'abc123def456',
  })
  @IsString()
  token: string;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  user: {
    id: string;
    phone: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}
