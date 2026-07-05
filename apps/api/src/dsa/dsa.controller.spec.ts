import { Test, TestingModule } from '@nestjs/testing';
import { Difficulty, DsaPattern, ConfidenceLevel } from '@devlog/types';
import { DsaController } from './dsa.controller';
import { DsaService } from './dsa.service';
import { CreateDsaDto } from './dto/create-dsa.dto';
import { UpdateDsaDto } from './dto/update-dsa.dto';

type MockDsaService = {
  create: jest.Mock;
  findAll: jest.Mock;
  findOne: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
};

describe('DsaController', () => {
  let controller: DsaController;
  let service: MockDsaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DsaController],
      providers: [
        {
          provide: DsaService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DsaController>(DsaController);
    service = module.get(DsaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a dsa problem through the service', async () => {
    const createDsaDto: CreateDsaDto = {
      problemName: 'Two Sum',
      problemNumber: 1,
      difficulty: Difficulty.EASY,
      pattern: DsaPattern.TWO_POINTERS,
      isSolved: false,
      confidenceLevel: ConfidenceLevel.HIGH,
      notes: 'Practice the hash map approach',
    };

    const createdDsa = { id: 'dsa-1', ...createDsaDto };
    service.create.mockResolvedValue(createdDsa);

    await expect(controller.create(createDsaDto)).resolves.toEqual(createdDsa);
    expect(service.create).toHaveBeenCalledWith(createDsaDto);
  });

  it('should return all dsa problems from the service', async () => {
    const dsaProblems = [{ id: 'dsa-1' }, { id: 'dsa-2' }];
    service.findAll.mockResolvedValue(dsaProblems);

    await expect(controller.findAll()).resolves.toEqual(dsaProblems);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return a single dsa problem from the service', async () => {
    const dsaProblem = { id: 'dsa-1' };
    service.findOne.mockResolvedValue(dsaProblem);

    await expect(controller.findOne('dsa-1')).resolves.toEqual(dsaProblem);
    expect(service.findOne).toHaveBeenCalledWith('dsa-1');
  });

  it('should update a dsa problem through the service', async () => {
    const updateDsaDto: UpdateDsaDto = { isSolved: true };
    const updatedDsa = { id: 'dsa-1', isSolved: true };
    service.update.mockResolvedValue(updatedDsa);

    await expect(controller.update('dsa-1', updateDsaDto)).resolves.toEqual(
      updatedDsa,
    );
    expect(service.update).toHaveBeenCalledWith('dsa-1', updateDsaDto);
  });

  it('should remove a dsa problem through the service', async () => {
    const removedDsa = { id: 'dsa-1' };
    service.remove.mockResolvedValue(removedDsa);

    await expect(controller.remove('dsa-1')).resolves.toEqual(removedDsa);
    expect(service.remove).toHaveBeenCalledWith('dsa-1');
  });
});
