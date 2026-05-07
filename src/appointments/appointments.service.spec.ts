import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { SalonsService } from '../salons/salons.service';
import { ServicesService } from '../services/services.service';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { User } from '../users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Salon } from '../salons/entities/salon.entity';
import { OperatingHours } from '../operating-hours/entities/operating-hours.entity';
import { CategoriesService } from '../categories/categories.service';
import { Service } from '../services/entities/service.entity';
import { Category } from '../categories/entities/category.entity';
import { AppointmentStatusEnum } from '../common/enums/appointment-status.enum';
import {
  mockedSalonObject,
  mockedSalonObjectWithOpHours,
  mockedServiceObject,
  mockedServiceObjectWithConcurrentLimit,
  mockedUserObject,
  mockedUserObjectWithAppLimitExceeded,
} from '../__tests__/fixtures/mockedEntityObjects';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let salonService: SalonsService;
  let servicesService: ServicesService;
  let userRepository: Repository<User>;

  const appointmentRepositoryToken = getRepositoryToken(Appointment);
  const userRepositoryToken = getRepositoryToken(User);
  const mockSalonRepo = {
    findOne: jest.fn(() => {
      return mockedSalonObject;
    }),
  };
  const mockServiceRepo = {
    findOne: jest.fn(() => {
      return mockedServiceObject;
    }),
  };
  const mockUserRepo = {
    findOne: jest.fn(() => {
      return mockedUserObject;
    }),
  };
  const mockAppRepo = {
    create: jest.fn((dto) => {
      return {
        ...dto,
        id: '679789789',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Appointment;
    }),
    save: jest.fn((dto) => {
      return dto as Appointment;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        SalonsService,
        ServicesService,
        CategoriesService,
        { provide: appointmentRepositoryToken, useValue: mockAppRepo },
        { provide: userRepositoryToken, useValue: mockUserRepo },
        { provide: getRepositoryToken(Salon), useValue: mockSalonRepo },
        {
          provide: getRepositoryToken(OperatingHours),
          useClass: OperatingHours,
        },
        { provide: getRepositoryToken(Service), useValue: mockServiceRepo },
        { provide: getRepositoryToken(Category), useClass: Category },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
    salonService = module.get<SalonsService>(SalonsService);
    servicesService = module.get<ServicesService>(ServicesService);
    userRepository = module.get<Repository<User>>(userRepositoryToken);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create Appointment', () => {
    describe('throwing exceptions', () => {
      it('should throw not found exception', async () => {
        try {
          await service.createAppointment('1', '2', '3', new Date(), '13:00');
        } catch (e) {
          if (e instanceof Error) {
            expect(e.message).toEqual('Salon 2 not found');
          } else {
            expect(e).toEqual('Salon 2 not found');
          }
        }
        try {
          jest
            .spyOn(salonService, 'findById')
            .mockResolvedValueOnce(new Salon());
          await service.createAppointment('1', '2', '3', new Date(), '13:00');
        } catch (e) {
          if (e instanceof Error) {
            expect(e.message).toEqual('Service not found');
          } else {
            expect(e).toEqual('Service not found');
          }
        }
        try {
          jest
            .spyOn(salonService, 'findById')
            .mockResolvedValueOnce(new Salon());
          jest
            .spyOn(servicesService, 'findById')
            .mockResolvedValueOnce(new Service());
          await service.createAppointment('1', '2', '3', new Date(), '13:00');
        } catch (e) {
          if (e instanceof Error) {
            expect(e.message).toEqual('Cannot find user!');
          } else {
            expect(e).toEqual('Cannot find user!');
          }
        }
      });
      it('should throw conflict exception', async () => {
        try {
          jest
            .spyOn(salonService, 'findById')
            .mockResolvedValueOnce(new Salon());
          jest
            .spyOn(servicesService, 'findById')
            .mockResolvedValueOnce(new Service());
          jest
            .spyOn(userRepository, 'findOne')
            .mockResolvedValueOnce(new User());
          jest.spyOn(service, 'checkOverlap').mockResolvedValueOnce(true);
          await service.createAppointment('1', '2', '3', new Date(), '13:00');
        } catch (e) {
          if (e instanceof Error) {
            expect(e.message).toEqual(
              'This appointment overlaps with an existing one!',
            );
          } else {
            expect(e).toEqual(
              'This appointment overlaps with an existing one!',
            );
          }
        }
      });
    });
    describe('not throwing exceptions', () => {
      it('should return Appointment object', async () => {
        jest
          .spyOn(salonService, 'findById')
          .mockResolvedValueOnce(mockedSalonObject);
        jest
          .spyOn(servicesService, 'findById')
          .mockResolvedValueOnce(mockedServiceObject);
        jest
          .spyOn(userRepository, 'findOne')
          .mockResolvedValueOnce(mockedUserObject);
        jest.spyOn(service, 'checkOverlap').mockResolvedValueOnce(false);
        await service
          .createAppointment('1', '2', '3', new Date(), '13:00')
          .then((data) => {
            expect(data.status).toBe(AppointmentStatusEnum.BOOKED);
          });
      });
    });
  });
  describe('check overlap', () => {
    it('should throw not found exception', async () => {
      jest.spyOn(servicesService, 'findById').mockImplementationOnce(jest.fn());
      try {
        jest.spyOn(salonService, 'findById').mockImplementationOnce(jest.fn());
        await service.checkOverlap(
          '1',
          new Date('2026-03-08T11:00:00'),
          '12:00:00',
          30,
        );
      } catch (e) {
        if (e instanceof Error) {
          expect(e.message).toEqual('Cannot find service!');
        } else {
          expect(e).toEqual('Cannot find service!');
        }
      }
    });
    it('should return true', async () => {
      jest
        .spyOn(servicesService, 'findById')
        .mockResolvedValueOnce(mockedServiceObject);
      expect(
        await service.checkOverlap(
          '1',
          new Date('2026-03-08T10:20:00'),
          '10:20:00',
          30,
        ),
      ).toEqual(true);
    });
    it('should return true', async () => {
      jest
        .spyOn(servicesService, 'findById')
        .mockResolvedValueOnce(mockedServiceObject);
      expect(
        await service.checkOverlap(
          '1',
          new Date('2026-03-08T09:40:00'),
          '09:40:00',
          30,
        ),
      ).toEqual(true);
    });
    it('should return false', async () => {
      jest
        .spyOn(servicesService, 'findById')
        .mockResolvedValueOnce(mockedServiceObject);
      expect(
        await service.checkOverlap(
          '1',
          new Date('2026-03-08T09:40:00'),
          '10:00:00',
          30,
        ),
      ).toEqual(false);
    });
    it('should return false', async () => {
      jest
        .spyOn(servicesService, 'findById')
        .mockResolvedValueOnce(mockedServiceObject);
      expect(
        await service.checkOverlap(
          '1',
          new Date('2026-03-08T09:40:00'),
          '12:00:00',
          30,
        ),
      ).toEqual(false);
    });
  });
  describe('check concurrent limit', () => {
    it('should throw not found exception', async () => {
      try {
        jest
          .spyOn(servicesService, 'findById')
          .mockImplementationOnce(jest.fn());
        await service.checkConcurrentLimit(
          '1',
          new Date('2026-03-08T11:00:00'),
          '12:00:00',
        );
      } catch (e) {
        if (e instanceof Error) {
          expect(e.message).toEqual('Cannot find service!');
        } else {
          expect(e).toEqual('Cannot find service!');
        }
      }
    });
    it('should return true', async () => {
      jest
        .spyOn(servicesService, 'findById')
        .mockResolvedValueOnce(mockedServiceObjectWithConcurrentLimit);
      expect(
        await service.checkConcurrentLimit(
          '1',
          new Date('2026-03-08T11:00:00'),
          '11:00:00',
        ),
      ).toEqual(true);
    });
    it('should return false', async () => {
      jest
        .spyOn(servicesService, 'findById')
        .mockResolvedValueOnce(mockedServiceObjectWithConcurrentLimit);
      expect(
        await service.checkConcurrentLimit(
          '1',
          new Date('2026-03-08T11:00:00'),
          '10:00:00',
        ),
      ).toEqual(false);
    });
  });
  describe('check user appointment limit', () => {
    it('should return not found exception', async () => {
      try {
        jest.spyOn(userRepository, 'findOne').mockImplementationOnce(jest.fn());
        await service.checkUserAppointmentLimit('2');
      } catch (e) {
        if (e instanceof Error) {
          expect(e.message).toEqual('Cannot find user!');
        } else {
          expect(e).toEqual('Cannot find user!');
        }
      }
    });
    it('should return true', async () => {
      jest.spyOn(userRepository, 'findOne').mockImplementationOnce(
        jest.fn(async () => {
          return mockedUserObjectWithAppLimitExceeded;
        }),
      );
      expect(await service.checkUserAppointmentLimit('2')).toEqual(true);
    });
    it('should return false', async () => {
      jest.spyOn(userRepository, 'findOne').mockImplementationOnce(
        jest.fn(async () => {
          return mockedUserObject;
        }),
      );
      expect(await service.checkUserAppointmentLimit('2')).toEqual(false);
    });
  });
  describe('check salon operating hours', () => {
    it('should return true - in operating hours - monday', async () => {
      jest.spyOn(salonService, 'findById').mockImplementation(
        jest.fn(async () => {
          return mockedSalonObjectWithOpHours;
        }),
      );
      expect(
        await service.checkSalonOperatingHours(
          '1',
          new Date('2026-05-04T07:00:00'),
          '08:00:00',
          30,
        ),
      ).toEqual(true);
    });
    it('should return false - outside of operating hours - thursday', async () => {
      jest.spyOn(salonService, 'findById').mockImplementation(
        jest.fn(async () => {
          return mockedSalonObjectWithOpHours;
        }),
      );
      expect(
        await service.checkSalonOperatingHours(
          '1',
          new Date('2026-05-07T07:00:00'),
          '06:00:00',
          30,
        ),
      ).toEqual(false);
    });
    it('should return false - closed - sunday', async () => {
      jest.spyOn(salonService, 'findById').mockImplementation(
        jest.fn(async () => {
          return mockedSalonObjectWithOpHours;
        }),
      );
      expect(
        await service.checkSalonOperatingHours(
          '1',
          new Date('2026-05-03T07:00:00'),
          '08:00:00',
          30,
        ),
      ).toEqual(false);
    });
  });
});
