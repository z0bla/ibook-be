import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { User } from '../users/entities/user.entity';
import { AppointmentsService } from './appointments.service';
import { SalonsService } from '../salons/salons.service';
import { ServicesService } from '../services/services.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, User]),
    SalonsService,
    ServicesService,
  ],
  controllers: [],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
