import { ApiProperty } from '@nestjs/swagger';
import { AppointmentWithRelationsDto } from './appointment-with-relations.dto';

export class PaginatedAppointmentResponseDto {
  @ApiProperty({ type: () => [AppointmentWithRelationsDto] })
  data: AppointmentWithRelationsDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  hasMore: boolean;
}
