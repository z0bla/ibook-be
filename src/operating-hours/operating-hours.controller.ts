import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  MarkOpenDto,
  UpdateOperatingHoursDto,
} from './dto/update-operating-hours.dto';
import { OperatingHoursService } from './operating-hours.service';

@ApiTags('Operating-hours')
@Controller('operating-hours')
export class OperatingHoursController {
  constructor(private readonly OperatingHoursService: OperatingHoursService) {}

  @Get('salon/:salonId')
  @ApiOperation({ summary: 'Get operating hours for a specific salon' })
  @ApiResponse({
    status: 200,
    description: 'Returned operating hours for the salon',
  })
  findBySalon(@Param('salonId') salonId: string) {
    return this.OperatingHoursService.getBySalonId(salonId);
  }
  @Put(':id')
  @ApiOperation({ summary: 'Update an OperatingHours record' })
  @ApiResponse({ status: 204, description: 'Returned updated hours record' })
  @ApiResponse({ status: 404, description: 'Cannot find hours record' })
  @ApiResponse({ status: 400, description: 'Invalid openTime and closeTime' })
  updateHours(
    @Body() hours: UpdateOperatingHoursDto,
    @Param('id') hoursId: string,
  ) {
    return this.OperatingHoursService.updateHours(hoursId, hours);
  }
  @Post(':id/mark-closed')
  @ApiOperation({ summary: 'Mark the salon as closed for the day' })
  @ApiResponse({ status: 204, description: 'Returned updated hours record' })
  @ApiResponse({ status: 404, description: 'Cannot find hours record' })
  markClosed(@Param('id') id: string) {
    return this.OperatingHoursService.markClosed(id);
  }
  @Post(':id/mark-open')
  @ApiOperation({ summary: 'Mark the salon opened for the day' })
  @ApiResponse({ status: 201, description: 'Returned updated hours record' })
  @ApiResponse({ status: 404, description: 'Cannot find hours record' })
  @ApiResponse({ status: 400, description: 'Invalid openTime and closeTime' })
  markOpen(@Param('id') id: string, @Body() hours: MarkOpenDto) {
    return this.OperatingHoursService.markOpen(id, hours);
  }
}
