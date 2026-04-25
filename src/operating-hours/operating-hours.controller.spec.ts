import { Test, TestingModule } from '@nestjs/testing';
import { OperatingHoursController } from './operating-hours.controller';

describe('OperatingHoursController', () => {
  let controller: OperatingHoursController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OperatingHoursController],
    }).compile();

    controller = module.get<OperatingHoursController>(OperatingHoursController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
