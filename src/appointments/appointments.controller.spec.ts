import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsController } from './appointments.controller';
import { Appointment } from './entities/appointment.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppointmentsService } from './appointments.service';
import { User } from '../users/entities/user.entity';
import { SalonsService } from '../salons/salons.service';
import { ServicesService } from '../services/services.service';
import { Salon } from '../salons/entities/salon.entity';
import { OperatingHours } from '../operating-hours/entities/operating-hours.entity';
import { CategoriesService } from '../categories/categories.service';
import { Service } from '../services/entities/service.entity';
import { Category } from '../categories/entities/category.entity';

describe('AppointmentsController', () => {
  let controller: AppointmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [
        AppointmentsService,
        SalonsService,
        ServicesService,
        CategoriesService,
        { provide: getRepositoryToken(Appointment), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(Salon), useValue: {} },
        { provide: getRepositoryToken(OperatingHours), useValue: {} },
        { provide: getRepositoryToken(Service), useValue: {} },
        { provide: getRepositoryToken(Category), useValue: {} },
      ],
    }).compile();

    controller = module.get<AppointmentsController>(AppointmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
