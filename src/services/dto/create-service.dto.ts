import { IsUUID, IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateServiceDto {
  @IsUUID()
  salonId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(15)
  duration: number;

  @IsNumber()
  @Min(0)
  price: number;
}
