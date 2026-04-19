import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Service } from './entities/service.entity';
import { SalonsService } from '../salons/salons.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly salonsService: SalonsService,
  ) {}

  async findBySalon(salonId: string): Promise<Service[]> {
    return this.serviceRepository.find({
      where: { salon: { id: salonId } },
      relations: ['salon'],
    });
  }

  async findById(id: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['salon'],
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async create(dto: CreateServiceDto): Promise<Service> {
    const salon = await this.salonsService.findById(dto.salonId);

    const service = this.serviceRepository.create({
      name: dto.name,
      duration: dto.duration,
      price: dto.price,
      salon,
    });

    return this.serviceRepository.save(service);
  }

  async update(id: string, dto: UpdateServiceDto): Promise<Service> {
    const service = await this.findById(id);

    Object.assign(service, dto);

    return this.serviceRepository.save(service);
  }

  async delete(id: string) {
    const service = await this.findById(id);

    await this.serviceRepository.remove(service);

    return {
      message: 'Service deleted successfully',
      id,
    };
  }
}
