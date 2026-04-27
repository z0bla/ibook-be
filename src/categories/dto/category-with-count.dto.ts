import { IsNumber, IsString, IsUUID } from 'class-validator';

export class CategoryWithCountDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsString()
  icon: string;

  @IsString()
  description: string;

  @IsNumber()
  salonCount: number;
}
