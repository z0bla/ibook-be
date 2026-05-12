import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { User } from '../users/entities/user.entity';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { SalonsModule } from '../salons/salons.module';
import { CategoriesModule } from '../categories/categories.module';
import { ServicesModule } from '../services/services.module';
import { OperatingHoursModule } from '../operating-hours/operating-hours.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, User]),
    SalonsModule,
    CategoriesModule,
    ServicesModule,
    OperatingHoursModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
