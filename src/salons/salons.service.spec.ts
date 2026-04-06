import { Test, TestingModule } from '@nestjs/testing';
import { SalonsService } from './salons.service';
import { CategoriesService } from '../categories/categories.service';

describe('SalonsService', () => {
  let service: SalonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalonsService,
        {
          provide: 'SalonRepository',
          useValue: {},
        },
        {
          provide: 'OperatingHoursRepository',
          useValue: {},
        },
        {
          provide: CategoriesService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<SalonsService>(SalonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
