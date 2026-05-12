import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { AppointmentStatusEnum } from '../../common/enums/appointment-status.enum';

export class AppointmentResponseDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;
  @IsNotEmpty()
  @IsUUID()
  userId: string;
  @IsNotEmpty()
  @IsUUID()
  salonId: string;
  @IsNotEmpty()
  @IsUUID()
  serviceId: string;
  @IsNotEmpty()
  @IsDate()
  appointmentDate: Date;
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
  appointmentTime: string;
  @IsNotEmpty()
  @IsNumber()
  duration: number;
  @IsNotEmpty()
  @IsEnum(AppointmentStatusEnum)
  status: AppointmentStatusEnum;
  @IsNotEmpty()
  @IsDate()
  createdAt: Date;
  @IsNotEmpty()
  @IsDate()
  updatedAt: Date;
}
