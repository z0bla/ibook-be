import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
  @ApiResponse({ status: 201, description: 'Salon created successfully' })
  create(@Body() createSalonDto: CreateSalonDto) {
    return this.salonsService.create(createSalonDto);
  }
}
