import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoodController } from './mood.controller';
import { MoodService } from './mood.service';
import { MoodLog } from './mood-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MoodLog])],
  controllers: [MoodController],
  providers: [MoodService],
  exports: [MoodService],
})
export class MoodModule {}
