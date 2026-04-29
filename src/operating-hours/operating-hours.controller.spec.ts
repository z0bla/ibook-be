import { Test, TestingModule } from '@nestjs/testing';
import { OperatingHoursController } from './operating-hours.controller';
import { OperatingHoursService } from './operating-hours.service';

describe('OperatingHoursController', () => {
  let controller: OperatingHoursController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OperatingHoursController],
      providers: [
        {
          provide: OperatingHoursService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<OperatingHoursController>(OperatingHoursController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
