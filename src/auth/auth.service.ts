import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * Generate and send magic link token via SMS/Email
   */
  async sendMagicLink(phone: string, email?: string): Promise<{ message: string }> {
    // Generate 6-digit token
    const token = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Find or create user
    let user = await this.usersRepository.findOne({ where: { phone } });

    if (!user) {
      // New user - create account
      user = this.usersRepository.create({
        phone,
        email,
        firstName: 'User',
        lastName: phone.slice(-4), // Temporary
        magicLinkToken: token,
        magicLinkExpires: expires,
      });
    } else {
      // Existing user - update token
      user.magicLinkToken = token;
      user.magicLinkExpires = expires;
      if (email) user.email = email;
    }

    await this.usersRepository.save(user);

    // TODO: Send SMS via Twilio
    // await this.twilioService.sendSMS(phone, `Your Protocol 66 login code: ${token}`);

    // TODO: Send Email via Nodemailer (if email provided)
    // if (email) {
    //   await this.emailService.sendMagicLink(email, token);
    // }

    console.log(`[DEV] Magic Link Token for ${phone}: ${token}`);

    return {
      message: 'Magic link sent successfully. Please check your phone.',
    };
  }

  /**
   * Verify magic link token and return JWT
   */
  async verifyMagicLink(token: string): Promise<{
    accessToken: string;
    user: Partial<User>;
  }> {
    const user = await this.usersRepository.findOne({
      where: { magicLinkToken: token },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (user.magicLinkExpires < new Date()) {
      throw new UnauthorizedException('Token has expired');
    }

    // Clear token
    user.magicLinkToken = null;
    user.magicLinkExpires = null;
    user.lastLoginAt = new Date();
    await this.usersRepository.save(user);

    // Generate JWT
    const payload = { sub: user.id, phone: user.phone, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  /**
   * Validate JWT and return user
   */
  async validateUser(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
