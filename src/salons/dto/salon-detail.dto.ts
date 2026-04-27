import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Service } from '../../services/entities/service.entity';
import { OperatingHours } from '../../operating-hours/entities/operating-hours.entity';

export class SalonDetailDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  phone: string;

  @IsString()
  description: string;

  @IsNumber()
  rating: number;

  @IsNumber()
  reviewCount: number;

  @IsString()
  image: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Service)
  services: Service[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OperatingHours)
  operatingHours: OperatingHours[];
}
