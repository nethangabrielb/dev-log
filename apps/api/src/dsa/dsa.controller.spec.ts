import { Test, TestingModule } from '@nestjs/testing';
import { DsaController } from './dsa.controller';
import { DsaService } from './dsa.service';

describe('DsaController', () => {
  let controller: DsaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DsaController],
      providers: [DsaService],
    }).compile();

    controller = module.get<DsaController>(DsaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
