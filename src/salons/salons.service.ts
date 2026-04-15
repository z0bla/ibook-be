import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Salon } from './entities/salon.entity';

@Injectable()
export class SalonsService {
  constructor(
    @InjectRepository(Salon)
    private readonly salonRepository: Repository<Salon>,
  ) {}

  async findAll(): Promise<Salon[]> {
    return this.salonRepository.find({
      relations: ['category', 'services', 'operatingHours'],
    });
  }

  async findById(id: string): Promise<Salon> {
    const salon = await this.salonRepository.findOne({
      where: { id },
      relations: ['category', 'services', 'operatingHours'],
    });

    if (!salon) {
      throw new NotFoundException('Salon not found');
    }

    return salon;
  }

  async findByCategory(categoryId: string): Promise<Salon[]> {
    return this.salonRepository.find({
      where: {
        category: { id: categoryId },
      },
      relations: ['category'],
    });
  }

  async create(data: Partial<Salon>): Promise<Salon> {
    const salon = this.salonRepository.create(data);
    return this.salonRepository.save(salon);
  }
}
