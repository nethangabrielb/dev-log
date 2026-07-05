import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Difficulty, DsaPattern, ConfidenceLevel } from '@devlog/types';
import { DsaService } from './dsa.service';
import { Dsa } from './schemas/dsa.schema';
import { CreateDsaDto } from './dto/create-dsa.dto';
import { UpdateDsaDto } from './dto/update-dsa.dto';

describe('DsaService', () => {
  let service: DsaService;

  const mockDsaModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DsaService,
        {
          provide: getModelToken(Dsa.name),
          useValue: mockDsaModel,
        },
      ],
    }).compile();

    service = module.get<DsaService>(DsaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a dsa problem', async () => {
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

    mockDsaModel.create.mockResolvedValue(createdDsa);

    await expect(service.create(createDsaDto)).resolves.toEqual(createdDsa);
    expect(mockDsaModel.create).toHaveBeenCalledWith(createDsaDto);
  });

  it('should return all dsa problems', async () => {
    const dsaProblems = [{ id: 'dsa-1' }, { id: 'dsa-2' }];
    mockDsaModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue(dsaProblems),
    });

    await expect(service.findAll()).resolves.toEqual(dsaProblems);
    expect(mockDsaModel.find).toHaveBeenCalled();
  });

  it('should return a single dsa problem by id', async () => {
    const dsaProblem = { id: 'dsa-1' };
    mockDsaModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(dsaProblem),
    });

    await expect(service.findOne('dsa-1')).resolves.toEqual(dsaProblem);
    expect(mockDsaModel.findById).toHaveBeenCalledWith('dsa-1');
  });

  it('should update a dsa problem by id', async () => {
    const updateDsaDto: UpdateDsaDto = { isSolved: true };
    const updatedDsa = { id: 'dsa-1', isSolved: true };
    mockDsaModel.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(updatedDsa),
    });

    await expect(service.update('dsa-1', updateDsaDto)).resolves.toEqual(
      updatedDsa,
    );
    expect(mockDsaModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'dsa-1',
      updateDsaDto,
      { new: true },
    );
  });

  it('should remove a dsa problem by id', async () => {
    const removedDsa = { id: 'dsa-1' };
    mockDsaModel.findByIdAndDelete.mockReturnValue({
      exec: jest.fn().mockResolvedValue(removedDsa),
    });

    await expect(service.remove('dsa-1')).resolves.toEqual(removedDsa);
    expect(mockDsaModel.findByIdAndDelete).toHaveBeenCalledWith('dsa-1');
  });
});
