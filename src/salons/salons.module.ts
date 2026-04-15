import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Salon } from './entities/salon.entity';
import { SalonsService } from './salons.service';

@Module({
  imports: [TypeOrmModule.forFeature([Salon])],
  providers: [SalonsService],
  exports: [SalonsService],
})
export class SalonsModule {}
