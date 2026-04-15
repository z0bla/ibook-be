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

  async findById(id: string): Promise<Salon> {
    const salon = await this.salonRepository.findOne({
      where: { id },
    });

    if (!salon) {
      throw new NotFoundException('Salon not found');
    }

    return salon;
  }
}
