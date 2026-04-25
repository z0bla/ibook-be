import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { SalonsService } from './salons.service';
import { CreateSalonDto } from './dto/create-salons.dto';

@ApiTags('Salons')
@Controller('salons')
export class SalonsController {
  constructor(private readonly salonsService: SalonsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all salons' })
  @ApiResponse({ status: 200, description: 'List of salons returned' })
  findAll() {
    return this.salonsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get salon by id' })
  @ApiResponse({ status: 200, description: 'Salon found' })
  @ApiResponse({ status: 400, description: 'Salon not found' })
  findById(@Param('id') id: string) {
    return this.salonsService.findById(id);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get salons by category' })
  @ApiResponse({ status: 200, description: 'Salons filtered by category' })
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.salonsService.findByCategory(categoryId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new salon' })
  @ApiResponse({
    status: 201,
    description: 'Salon created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Salon name already exists',
  })
  @ApiBody({
    description: 'Salon registration with 7 operating hours',
    examples: {
      example1: {
        value: {
          categoryId: 'cat-uuid-1',
          name: 'Chic Hair Studio',
          address: '123 Main St',
          phone: '+1-555-0123',
          description: 'Professional salon',
          operatingHours: [
            { day: 'Monday', openTime: '09:00', closeTime: '18:00' },
            { day: 'Tuesday', openTime: '09:00', closeTime: '18:00' },
            { day: 'Wednesday', openTime: '09:00', closeTime: '18:00' },
            { day: 'Thursday', openTime: '09:00', closeTime: '18:00' },
            { day: 'Friday', openTime: '09:00', closeTime: '18:00' },
            { day: 'Saturday', openTime: '10:00', closeTime: '16:00' },
            { day: 'Sunday', openTime: '00:00', closeTime: '00:00' },
          ],
        },
      },
    },
  })
  create(@Body() createSalonDto: CreateSalonDto) {
    return this.salonsService.create(createSalonDto);
  }
}
