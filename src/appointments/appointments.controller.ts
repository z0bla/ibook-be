import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { Appointment } from './entities/appointment.entity';
import { AppointmentResponseDto } from './dto/appointmentResponseDto';
import { JwtAuthGurad } from '../auth';
import { CreateAppointmentDto } from './dto/createAppointmentDto';
import { Repository } from 'typeorm';
import { AppointmentStatusEnum } from '../common/enums/appointment-status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { AppointmentWithRelationsDto } from './dto/appointment-with-relations.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from './dto/pagination.dto';
import { PaginatedAppointmentResponseDto } from './dto/paginated-appointment-response.dto';
import { User } from '../users/entities/user.entity';

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
  ) {}

  @UseGuards(JwtAuthGurad)
  @Get('upcoming')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user's upcoming appointments" })
  @ApiResponse({ status: 200, description: 'Returned upcoming appointments ' })
  @ApiResponse({ status: 401, description: 'Not authorized' })
  async getUpcoming(
    @CurrentUser() user: User,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedAppointmentResponseDto> {
    const limit = pagination.limit ?? 10;
    const offset = pagination.offset ?? 0;
    const result = await this.appointmentsService.getUpcomingAppointments(
      user.id,
      limit,
      offset,
    );
    return {
      data: result.data.map((app) => this.toAppointmentWithRelationsDto(app)),
      total: result.total,
      hasMore: offset + limit < result.total,
    };
  }

  @UseGuards(JwtAuthGurad)
  @Get('past')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user's past appointments" })
  @ApiResponse({ status: 200, description: 'Returned past appointments ' })
  @ApiResponse({ status: 401, description: 'Not authorized' })
  async getPast(
    @CurrentUser() user: User,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedAppointmentResponseDto> {
    const limit = pagination.limit ?? 10;
    const offset = pagination.offset ?? 0;
    const result = await this.appointmentsService.getPastAppointments(
      user.id,
      limit,
      offset,
    );
    return {
      data: result.data.map((app) => this.toAppointmentWithRelationsDto(app)),
      total: result.total,
      hasMore: offset + limit < result.total,
    };
  }

  @UseGuards(JwtAuthGurad)
  @Get(':id')
  @ApiOperation({ summary: 'Get one appointment with the specified id' })
  @ApiResponse({ status: 200, description: 'Returned the appointment' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @ApiResponse({ status: 401, description: 'Not authorized' })
  async getOne(@Param('id') id: string) {
    const appoint: Appointment = await this.appointmentsService.findById(id);
    const result: AppointmentResponseDto = {
      id: appoint.id,
      userId: appoint.user.id,
      salonId: appoint.salon.id,
      serviceId: appoint.service.id,
      appointmentDate: appoint.appointmentDate,
      appointmentTime: appoint.appointmentTime,
      duration: appoint.duration,
      status: appoint.status,
      createdAt: appoint.createdAt,
      updatedAt: appoint.updatedAt,
    };
    return result;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({ status: 200, description: 'Appointment created succesfully' })
  @ApiResponse({ status: 404, description: 'User, service or salon not found' })
  @ApiResponse({ status: 401, description: 'Not authorized' })
  @ApiResponse({
    status: 409,
    description: 'Appointment overlaps with the existing one',
  })
  @ApiResponse({ status: 400, description: 'Input data is not valid' })
  @ApiBody({
    description: 'Creating an appointment',
    examples: {
      example1: {
        value: {
          userId: 'user-uuid-1',
          salonId: 'salon-uuid-1',
          serviceId: 'service-uuid-1',
          appointmentDate: '2026-05-06T12:00:00',
          appointmentTime: '12:00',
        },
      },
      example2: {
        value: {
          userId: 'user-uuid-2',
          salonId: 'salon-uuid-2',
          serviceId: 'service-uuid-2',
          appointmentDate: '2025-11-14T12:00:00',
          appointmentTime: '12:00',
        },
      },
    },
  })
  createAppointment(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.createAppointment(
      dto.userId,
      dto.salonId,
      dto.serviceId,
      new Date(dto.appointmentDate),
      dto.appointmentTime,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete an appointment with the given id' })
  @ApiResponse({ status: 401, description: 'Not authorized' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async cancelAppointment(@Param('id') id: string) {
    const appo = await this.appointmentRepo.findOne({ where: { id: id } });
    if (!appo) {
      throw new NotFoundException('Appointment not found!');
    }
    await this.appointmentRepo.update(id, {
      status: AppointmentStatusEnum.CANCELLED,
    });
    return 'Appointment cancelled succesfully';
  }

  toAppointmentWithRelationsDto(
    appointment: Appointment,
  ): AppointmentWithRelationsDto {
    return {
      id: appointment.id,
      userId: appointment.user.id,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      duration: appointment.duration,
      status: appointment.status,
      salon: {
        id: appointment.salon.id,
        name: appointment.salon.name,
        address: appointment.salon.address,
        phone: appointment.salon.phone,
        image: appointment.salon.image,
        rating: appointment.salon.rating,
      },
      service: {
        id: appointment.service.id,
        name: appointment.service.name,
        duration: appointment.service.duration,
        price: appointment.service.price,
      },
      category: {
        id: appointment.salon.category.id,
        name: appointment.salon.category.name,
        icon: appointment.salon.category.icon,
      },
    };
  }
}
