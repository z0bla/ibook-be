import { ApiProperty } from '@nestjs/swagger';

class SalonInfo {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  phone: string;

  @ApiProperty({ required: false })
  image?: string;

  @ApiProperty()
  rating: number;
}

class ServiceInfo {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  price: number;
}

class CategoryInfo {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  icon: string;
}

export class AppointmentWithRelationsDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  appointmentDate: Date;

  @ApiProperty()
  appointmentTime: string;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  status: string;

  @ApiProperty({ type: () => SalonInfo })
  salon: SalonInfo;

  @ApiProperty({ type: () => ServiceInfo })
  service: ServiceInfo;

  @ApiProperty({ type: () => CategoryInfo })
  category: CategoryInfo;
}
