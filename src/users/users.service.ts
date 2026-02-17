import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async updateProfile(userId: string, updates: Partial<User>) {
    await this.usersRepository.update(userId, updates);
    return this.findById(userId);
  }

  async updateFCMToken(userId: string, fcmToken: string) {
    await this.usersRepository.update(userId, { fcmToken });
  }
}
