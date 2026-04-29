import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Salon } from '../salons/entities/salon.entity';
import { SalonsModule } from '../salons/salons.module';
import { OperatingHours } from './entities/operating-hours.entity';
import { OperatingHoursController } from './operating-hours.controller';
import { OperatingHoursService } from './operating-hours.service';

@Module({
  imports: [TypeOrmModule.forFeature([OperatingHours, Salon]), SalonsModule],
  controllers: [OperatingHoursController],
  providers: [OperatingHoursService],
  exports: [OperatingHoursService],
})
export class OperatingHoursModule {}
