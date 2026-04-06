import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsUrl,
  IsArray,
  ValidateNested,
  Matches,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DayEnum } from '../../common/enums/day.enum';

// DTO za operating hours
export class CreateOperatingHoursDto {
  @IsEnum(DayEnum)
  day!: DayEnum;

  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
  openTime!: string;

  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
  closeTime!: string;
}

// Glavni DTO
export class CreateSalonDto {
  @IsUUID()
  categoryId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsOptional()
  @IsUrl()
  image?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOperatingHoursDto)
  operatingHours!: CreateOperatingHoursDto[];
}
