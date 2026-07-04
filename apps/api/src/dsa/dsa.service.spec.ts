import { Test, TestingModule } from '@nestjs/testing';
import { DsaService } from './dsa.service';

describe('DsaService', () => {
  let service: DsaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DsaService],
    }).compile();

    service = module.get<DsaService>(DsaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
