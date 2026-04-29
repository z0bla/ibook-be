import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalonsService } from '../salons/salons.service';
import {
  MarkOpenDto,
  UpdateOperatingHoursDto,
} from './dto/update-operating-hours.dto';
import { OperatingHours } from './entities/operating-hours.entity';
import { DayEnum } from '../common/enums/day.enum';

@Injectable()
export class OperatingHoursService {
  constructor(
    @InjectRepository(OperatingHours)
    private readonly hoursRepository: Repository<OperatingHours>,

    private readonly salonService: SalonsService,
  ) {}
  async getBySalonId(salonId: string): Promise<OperatingHours[]> {
    const salon = await this.salonService.findById(salonId);
    return salon.operatingHours;
  }
  trimSeconds(time: string): string {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  }
  validateTimes(openTime: string, closeTime: string) {
    const testRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (openTime.split(':')[0].length === 1) {
      openTime = `0${openTime}`;
    }
    if (closeTime.split(':')[0].length === 1) {
      closeTime = `0${closeTime}`;
    }
    if (!testRegex.test(openTime) || !testRegex.test(closeTime)) {
      throw new BadRequestException('Time format must be HH:MM!');
    }
    if (openTime >= closeTime) {
      throw new BadRequestException(
        'Opening time should be before closing time!',
      );
    }
  }
  async updateHours(
    id: string,
    hours: UpdateOperatingHoursDto,
  ): Promise<OperatingHours> {
    const prev = await this.hoursRepository.findOne({ where: { id: id } });
    if (!prev) {
      throw new NotFoundException('Invalid Operating Hours Id');
    }
    this.validateTimes(
      hours.openTime || this.trimSeconds(prev.openTime),
      hours.closeTime || this.trimSeconds(prev.closeTime),
    );

    if (hours.openTime) {
      prev.openTime = hours.openTime;
    }
    if (hours.closeTime) {
      prev.closeTime = hours.closeTime;
    }
    await this.hoursRepository.save(prev);
    return prev;
  }
  async markClosed(hoursId: string): Promise<OperatingHours> {
    const hours = await this.hoursRepository.findOne({
      where: { id: hoursId },
    });
    if (!hours) {
      throw new NotFoundException('Invalid Operating Hours Id');
    }
    hours.isClosed = true;
    await this.hoursRepository.save(hours);
    return hours;
  }
  async markOpen(hoursId: string, hours: MarkOpenDto): Promise<OperatingHours> {
    const record = await this.hoursRepository.findOne({
      where: { id: hoursId },
    });
    if (!record) {
      throw new NotFoundException('Invalid Operating Hours Id');
    }
    this.validateTimes(hours.openTime, hours.closeTime);
    record.openTime = hours.openTime;
    record.closeTime = hours.closeTime;
    record.isClosed = false;
    await this.hoursRepository.save(record);
    return record;
  }
  async isOpen(salonId: string, dateTime: Date): Promise<boolean> {
    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();
    const time: string = `${hours}:${minutes}`;
    const days: string[] = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const day = days[dateTime.getDay()];
    const salon = await this.salonService.findById(salonId);
    if (!salon) {
      throw new NotFoundException('Salon Id is not valid!');
    }
    const findDay = salon.operatingHours.find((rec) => {
      return rec.day == DayEnum[day.toUpperCase()];
    });
    if (!findDay) {
      throw new NotFoundException(`Cannot find the hours record for ${day}`);
    }
    if (findDay.isClosed) {
      return false;
    }
    if (time < findDay.openTime || time > findDay.closeTime) {
      return false;
    }
    return true;
  }
}
