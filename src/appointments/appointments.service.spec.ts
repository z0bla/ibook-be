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
  app1,
  app2,
  app3,
  app4,
  app5,
  app6,
  mockedSalonObject,
  mockedSalonObjectWithOpHours,
  mockedServiceObject,
  mockedUserObject,
} from '../__tests__/fixtures/mockedEntityObjects';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let salonService: SalonsService;
  let servicesService: ServicesService;
  let userRepository: Repository<User>;
  let appointmentRepository: Repository<Appointment>;

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
      return { ...mockedUserObject, previousSalons: [] };
    }),
    save: jest.fn((user: User) => user),
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
    findOne: jest.fn(() => {
      return app1;
    }),
    find: jest.fn(() => {
      return app1;
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
    appointmentRepository = module.get<Repository<Appointment>>(
      appointmentRepositoryToken,
    );
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
        jest.spyOn(salonService, 'findById').mockImplementationOnce(jest.fn());
        try {
          await service.createAppointment('1', '2', '3', new Date(), '13:00');
        } catch (e) {
          if (e instanceof Error) {
            expect(e.message).toEqual('Salon not found');
          } else {
            expect(e).toEqual('Salon not found');
          }
        }
        try {
          jest
            .spyOn(salonService, 'findById')
            .mockResolvedValueOnce(new Salon());
          jest
            .spyOn(servicesService, 'findById')
            .mockImplementationOnce(jest.fn());
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
          jest
            .spyOn(userRepository, 'findOne')
            .mockImplementationOnce(jest.fn());
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
          jest
            .spyOn(service, 'checkSalonOperatingHours')
            .mockResolvedValueOnce(false);
          await service.createAppointment('1', '2', '3', new Date(), '13:00');
        } catch (e) {
          if (e instanceof Error) {
            expect(e.message).toEqual(
              'Appointment time must be in operating hours',
            );
          } else {
            expect(e).toEqual('Appointment time must be in operating hours');
          }
        }
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
          jest
            .spyOn(service, 'checkSalonOperatingHours')
            .mockResolvedValueOnce(true);
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
        jest
          .spyOn(service, 'checkConcurrentLimit')
          .mockResolvedValueOnce(false);
        jest
          .spyOn(service, 'checkUserAppointmentLimit')
          .mockResolvedValueOnce(false);
        jest.spyOn(service, 'checkOverlap').mockResolvedValueOnce(false);
        await service
          .createAppointment(
            '1',
            '2',
            '3',
            new Date('2026-05-11T13:00:00'),
            '13:00',
          )
          .then((data) => {
            expect(data.status).toBe(AppointmentStatusEnum.BOOKED);
          });
      });
    });
  });
  describe('findById', () => {
    it('should throw NotFoundException', async () => {
      jest
        .spyOn(appointmentRepository, 'findOne')
        .mockImplementationOnce(jest.fn());
      try {
        await service.findById('1');
      } catch (e) {
        if (e instanceof Error) {
          expect(e.message).toEqual('appointment not found!');
        } else {
          expect(e).toEqual('appointment not found!');
        }
      }
    });
    it('should return appointment object', async () => {
      expect(await service.findById('1')).toEqual(app1);
    });
  });
  describe('check overlap', () => {
    it('should return false', async () => {
      jest.spyOn(appointmentRepository, 'find').mockResolvedValueOnce([]);
      expect(
        await service.checkOverlap(
          '1',
          new Date('2026-03-08T11:00:00'),
          '12:00:00',
          30,
        ),
      ).toBe(false);
    });
    it('should return true', async () => {
      jest
        .spyOn(appointmentRepository, 'find')
        .mockResolvedValueOnce([app1, app2, app3]);
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
        .spyOn(appointmentRepository, 'find')
        .mockResolvedValueOnce([app1, app2, app3]);
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
        .spyOn(appointmentRepository, 'find')
        .mockResolvedValueOnce([app1, app2, app3]);
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
        .spyOn(appointmentRepository, 'find')
        .mockResolvedValueOnce([app1, app2, app3]);
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
    it('should return false', async () => {
      jest.spyOn(appointmentRepository, 'find').mockResolvedValueOnce([]);
      expect(
        await service.checkConcurrentLimit(
          '1',
          new Date('2026-03-08T11:00:00'),
          '12:00:00',
        ),
      ).toBe(false);
    });
    it('should return true', async () => {
      jest
        .spyOn(appointmentRepository, 'find')
        .mockResolvedValueOnce([
          app1,
          app2,
          app3,
          app4,
          app4,
          app4,
          app4,
          app4,
        ]);
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
        .spyOn(appointmentRepository, 'find')
        .mockResolvedValueOnce([
          app1,
          app2,
          app3,
          app4,
          app4,
          app4,
          app4,
          app4,
        ]);
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
    it('should return false', async () => {
      jest.spyOn(appointmentRepository, 'find').mockResolvedValueOnce([]);
      expect(await service.checkUserAppointmentLimit('2')).toBe(false);
    });
    it('should return true', async () => {
      jest
        .spyOn(appointmentRepository, 'find')
        .mockResolvedValueOnce([
          app1,
          app2,
          app3,
          app4,
          app1,
          app2,
          app3,
          app4,
          app1,
          app2,
          app6,
          app5,
        ]);
      expect(await service.checkUserAppointmentLimit('2')).toBe(true);
    });
    it('should return false', async () => {
      jest
        .spyOn(appointmentRepository, 'find')
        .mockResolvedValueOnce([app1, app2, app3, app4]);
      expect(await service.checkUserAppointmentLimit('2')).toBe(false);
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

  describe('addToPreviousSalons', () => {
    it("should add salon to user's previous salons if not already visited", async () => {
      const mockUser = { ...mockedUserObject, previousSalons: [] as Salon[] };

      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);
      jest
        .spyOn(salonService, 'findById')
        .mockResolvedValueOnce(mockedSalonObject);

      await service.addToPreviousSalons('1', 'salonid');

      expect(mockUserRepo.save).toHaveBeenCalled();
      expect(mockUser.previousSalons).toHaveLength(1);
      expect(mockUser.previousSalons[0].id).toBe('salonid');
    });

    it('should not add duplicate salon if already visited', async () => {
      const mockUser = {
        ...mockedUserObject,
        previousSalons: [mockedSalonObject] as Salon[],
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);

      await service.addToPreviousSalons('1', 'salonid');

      expect(mockUserRepo.save).not.toHaveBeenCalled();
      expect(mockUser.previousSalons).toHaveLength(1);
    });
  });

  describe('getAndSortAppointments', () => {
    it('should return empty array when user has no appointments', async () => {
      jest.spyOn(appointmentRepository, 'find').mockResolvedValueOnce([]);

      const result = await service.getAndSortAppointments('1');

      expect(result.upcoming).toEqual([]);
      expect(result.past).toEqual([]);
    });

    it('should correctly separate upcoming and past appointments', async () => {
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + 10);
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - 10);

      const futureApp: Appointment = {
        ...app1,
        id: 'future-1',
        appointmentDate: futureDate,
        appointmentTime: '10:00',
        status: AppointmentStatusEnum.BOOKED,
      };

      const pastBookedApp: Appointment = {
        ...app1,
        id: 'past-booked-1',
        appointmentDate: pastDate,
        appointmentTime: '10:00',
        status: AppointmentStatusEnum.BOOKED,
      };

      const pastCompletedApp: Appointment = {
        ...app1,
        id: 'past-completed-1',
        appointmentDate: pastDate,
        appointmentTime: '10:00',
        status: AppointmentStatusEnum.COMPLETED,
      };

      jest
        .spyOn(appointmentRepository, 'find')
        .mockResolvedValueOnce([futureApp, pastBookedApp, pastCompletedApp]);

      const result = await service.getAndSortAppointments('1');

      expect(result.upcoming).toHaveLength(1);
      expect(result.upcoming[0].id).toBe('future-1');
      expect(result.past).toHaveLength(2);
      expect(result.past[0].id).toBe('past-booked-1');
    });
  });
});
