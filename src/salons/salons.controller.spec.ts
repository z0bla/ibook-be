import { Test, TestingModule } from '@nestjs/testing';
import { SalonsController } from './salons.controller';
import { SalonsService } from './salons.service';

describe('SalonsController', () => {
  let controller: SalonsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalonsController],
      providers: [
        {
          provide: SalonsService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<SalonsController>(SalonsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
