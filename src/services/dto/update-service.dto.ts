import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(15)
  duration?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}
