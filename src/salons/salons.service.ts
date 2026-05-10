import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { Salon } from './entities/salon.entity';
import { OperatingHours } from '../operating-hours/entities/operating-hours.entity';
import { DayEnum } from '../common/enums/day.enum';
import { CreateSalonDto, OperatingHoursDto } from './dto/create-salons.dto';

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

  validateHours(hours: OperatingHoursDto) {
    const dayRegex =
      /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/;
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

    // Provera da li je dan ispravno unesen
    if (!dayRegex.test(hours.day)) {
      throw new BadRequestException(
        `Invalid day: ${hours.day}. Must be Monday-Sunday!`,
      );
    }
    // Provera da li su sati u opsegu 00:00-23:59
    if (!timeRegex.test(hours.openTime) || !timeRegex.test(hours.closeTime)) {
      throw new BadRequestException('Time format must be HH:MM!');
    }
    if (hours.openTime === '00:00' && hours.closeTime === '00:00') {
      return;
    }
    // Provera da li je openTime<closeTime
    if (hours.openTime >= hours.closeTime) {
      throw new BadRequestException(
        'Opening time should be before closing time!',
      );
    }
  }

  async create(createSalonDto: CreateSalonDto): Promise<Salon> {
    const { categoryId, operatingHours, ...rest } = createSalonDto;

    // Pronađi category
    const category = await this.categoriesService.findById(categoryId);

    // Proveri da li salon vec postoji
    const existingSalon = await this.salonRepository.findOne({
      where: { name: createSalonDto.name },
    });
    if (existingSalon) {
      throw new ConflictException(
        `Salon ${createSalonDto.name} already exists!`,
      );
    }

    // Proveri da li su sati uredno uneseni
    for (const hours of createSalonDto.operatingHours) {
      this.validateHours(hours);
    }

    // Napravi salon
    const salon = this.salonRepository.create({
      ...rest,
      appointments: [],
      category,
      rating: 0,
      reviewCount: 0,
    });

    const savedSalon = await this.salonRepository.save(salon);

    // Napravi operating hours
    const hoursArray = operatingHours.map((hour) =>
      this.hoursRepository.create({
        day: DayEnum[hour.day.toUpperCase()] as DayEnum,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
        isClosed: hour.openTime === '00:00' && hour.closeTime === '00:00',
        salon: savedSalon, // ovdje TypeORM prepoznaje vezu
      }),
    );

    await this.hoursRepository.save(hoursArray);

    // Vrati salon sa svim relacijama
    return this.findById(savedSalon.id);
  }
}
