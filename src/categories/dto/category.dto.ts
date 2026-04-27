import { IsString, IsUUID } from 'class-validator';

export class CategoryDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsString()
  description: string;
}
