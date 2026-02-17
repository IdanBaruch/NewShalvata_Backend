import { Module, Controller, Get } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MedicationsModule } from './medications/medications.module';
import { MoodModule } from './mood/mood.module';
import { ClinicianModule } from './clinician/clinician.module';

// Health Check Controller
@Controller()
class AppController {
  @Get('health')
  health() {
    return {
      status: 'healthy',
      service: 'protocol66-api',
      timestamp: new Date().toISOString(),
    };
  }
}

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // Schedule for cron jobs (reminders, alerts)
    ScheduleModule.forRoot(),

    // Feature modules
    AuthModule,
    UsersModule,
    MedicationsModule,
    MoodModule,
    ClinicianModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
