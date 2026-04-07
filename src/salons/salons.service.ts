import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { Salon } from './entities/salon.entity';
import { OperatingHours } from '../operating-hours/entities/operating-hours.entity';
import { DayEnum } from '../common/enums/day.enum';

interface CreateOperatingHoursDto {
  day: DayEnum;
  openTime: string;
  closeTime: string;
  isClosed?: boolean;
}

interface CreateSalonDto {
  name: string;
  address: string;
  phone: string;
  description?: string;
  image?: string;
  categoryId: string;
  operatingHours: CreateOperatingHoursDto[];
}

@Injectable()
export class SalonsService {
  constructor(
    @InjectRepository(Salon)
    private readonly salonRepository: Repository<Salon>,

    @InjectRepository(OperatingHours)
    private readonly hoursRepository: Repository<OperatingHours>,

    private readonly categoriesService: CategoriesService,
  ) {}

  async findAll(): Promise<Salon[]> {
    return this.salonRepository.find({
      relations: ['category', 'services', 'operatingHours'],
      order: { rating: 'DESC' },
    });
  }

  async findById(id: string): Promise<Salon> {
    const salon = await this.salonRepository.findOne({
      where: { id },
      relations: ['category', 'services', 'operatingHours'],
    });

    if (!salon) {
      throw new NotFoundException(`Salon ${id} not found`);
    }

    return salon;
  }

  async findByCategory(categoryId: string): Promise<Salon[]> {
    return this.salonRepository.find({
      where: {
        category: { id: categoryId },
      },
      relations: ['category', 'services', 'operatingHours'],
    });
  }

  async create(createSalonDto: CreateSalonDto): Promise<Salon> {
    const { categoryId, operatingHours, ...rest } = createSalonDto;

    // Pronađi category
    const category = await this.categoriesService.findById(categoryId);

    // Napravi salon
    const salon = this.salonRepository.create({
      ...rest,
      category,
    });

    const savedSalon = await this.salonRepository.save(salon);

    // Napravi operating hours
    const hoursArray = operatingHours.map((hour) =>
      this.hoursRepository.create({
        ...hour,
        salon: savedSalon, // ovdje TypeORM prepoznaje vezu
      }),
    );

    await this.hoursRepository.save(hoursArray);

    // Vrati salon sa svim relacijama
    return this.findById(savedSalon.id);
  }
}
