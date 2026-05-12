import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID, Matches } from 'class-validator';

export class CreateAppointmentDto {
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
  @Type(() => Date)
  appointmentDate: Date;
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
  appointmentTime: string;
}
