import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Service } from './entities/service.entity';
import { ServicesService } from './services.service';
import { SalonsModule } from '../salons/salons.module';
import { ServicesController } from './services.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Service]), SalonsModule],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
