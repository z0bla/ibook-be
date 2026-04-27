import { CategoryDto } from '../../categories/dto/category.dto';
import { SalonDetailDto } from './salon-detail.dto';

export class SalonsListResponseDto {
  category: CategoryDto;
  salons: SalonDetailDto[];
  totalCount: number;
}
