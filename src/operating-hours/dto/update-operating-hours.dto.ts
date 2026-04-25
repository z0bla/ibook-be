import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class UpdateOperatingHoursDto {
  @IsOptional()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
  openTime?: string;
  @IsOptional()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
  closeTime?: string;
  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;
}
export class MarkOpenDto {
  @IsNotEmpty()
  @IsString()
  openTime: string;
  @IsNotEmpty()
  @IsString()
  closeTime: string;
}
