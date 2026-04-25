import { Test, TestingModule } from '@nestjs/testing';
import { OperatingHoursService } from './operating-hours.service';

describe('OperatingHoursService', () => {
  let service: OperatingHoursService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OperatingHoursService],
    }).compile();

    service = module.get<OperatingHoursService>(OperatingHoursService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
