import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Salon } from '../salons/entities/salon.entity';
import { SalonsModule } from '../salons/salons.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Salon]),
    forwardRef(() => SalonsModule),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
