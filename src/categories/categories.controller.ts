// src/categories/categories.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { SalonsService } from '../salons/salons.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Category } from './entities/category.entity';

@ApiTags('categories') // grupa u Swagger UI
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly salonsService: SalonsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories with salon counts' })
  @ApiResponse({
    status: 200,
    description: 'List of categories with salon counts',
  })
  async findAll(): Promise<Category[]> {
    return this.categoriesService.findAllWithSalonCount();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single category by ID' })
  @ApiResponse({ status: 200, description: 'Category found', type: Category })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findById(@Param('id') id: string): Promise<Category> {
    const category = await this.categoriesService.findById(id);
    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    return category;
  }

  @Get(':id/salons')
  @ApiOperation({ summary: 'Get salons by category ' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['rating', 'name'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Category with salons list' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async getSalonsByCategory(
    @Param('id') categoryId: string,
    @Query('sortBy') sortBy: 'rating' | 'name' = 'rating',
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ) {
    return await this.salonsService.findByCategory(
      categoryId,
      sortBy,
      limit,
      offset,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create new category' })
  @ApiResponse({ status: 201, description: 'Category created', type: Category })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }
}
