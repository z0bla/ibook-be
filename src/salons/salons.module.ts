import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Salon } from './entities/salon.entity';
import { OperatingHours } from '../operating-hours/entities/operating-hours.entity';

import { SalonsService } from './salons.service';
import { SalonsController } from './salons.controller';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Salon, OperatingHours]),
    forwardRef(() => CategoriesModule),
  ],
  controllers: [SalonsController],
  providers: [SalonsService],
  exports: [SalonsService],
})
export class SalonsModule {}
