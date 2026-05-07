import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import databaseConfig from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { SalonsModule } from './salons/salons.module';
import { ServicesModule } from './services/services.module';
import jwtConfig from './config/jwt.config';
import { OperatingHoursModule } from './operating-hours/operating-hours.module';
import { AppointmentsService } from './appointments/appointments.service';
import { AppointmentsModule } from './appointments/appointments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
    }),
    DatabaseModule,
    AuthModule,
    CategoriesModule,
    SalonsModule,
    ServicesModule,
    OperatingHoursModule,
    AppointmentsModule,
  ],
  providers: [AppointmentsService],
})
export class AppModule {}
