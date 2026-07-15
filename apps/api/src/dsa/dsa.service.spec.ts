import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Difficulty, DsaPattern, ConfidenceLevel } from '@devlog/types';
import { DsaService } from './dsa.service';
import { Dsa } from './schemas/dsa.schema';
import { CreateDsaDto } from './dto/create-dsa.dto';
import { UpdateDsaDto } from './dto/update-dsa.dto';

const userId = 'user-1';
const timezone = 'Asia/Manila';
const validId = '507f1f77bcf86cd799439011';

const createQueryResult = <T>(value: T) => ({
  exec: jest.fn().mockResolvedValue(value),
});

describe('DsaService', () => {
  let service: DsaService;

  const mockDsaModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    aggregate: jest.fn(),
    countDocuments: jest.fn(),
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

    await expect(service.create(createDsaDto, userId)).resolves.toEqual(
      createdDsa,
    );
    expect(mockDsaModel.create).toHaveBeenCalledWith({
      ...createDsaDto,
      userId,
    });
  });

  it('should return all dsa problems', async () => {
    const dsaProblems = [{ id: 'dsa-1' }, { id: 'dsa-2' }];
    mockDsaModel.find.mockReturnValue(createQueryResult(dsaProblems));

    await expect(service.findAll(userId)).resolves.toEqual(dsaProblems);
    expect(mockDsaModel.find).toHaveBeenCalledWith({ userId });
  });

  it('should return a single dsa problem by id', async () => {
    const dsaProblem = { id: 'dsa-1', userId };
    mockDsaModel.findById.mockReturnValue(createQueryResult(dsaProblem));

    await expect(service.findOne(validId, userId)).resolves.toEqual(dsaProblem);
    expect(mockDsaModel.findById).toHaveBeenCalledWith(validId);
  });

  it('should update a dsa problem by id', async () => {
    const updateDsaDto: UpdateDsaDto = { isSolved: true };
    const dsa = {
      id: 'dsa-1',
      userId,
      save: jest.fn().mockResolvedValue({ id: 'dsa-1', isSolved: true }),
    };
    mockDsaModel.findById.mockReturnValue(createQueryResult(dsa));

    await expect(
      service.update(validId, updateDsaDto, userId),
    ).resolves.toEqual({
      id: 'dsa-1',
      isSolved: true,
    });
    expect(dsa.save).toHaveBeenCalled();
  });

  it('should remove a dsa problem by id', async () => {
    const dsa = {
      id: 'dsa-1',
      userId,
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    };
    mockDsaModel.findById.mockReturnValue(createQueryResult(dsa));

    await expect(service.remove(validId, userId)).resolves.toEqual({
      deletedCount: 1,
    });
    expect(dsa.deleteOne).toHaveBeenCalled();
  });

  it('should return dsa statistics', async () => {
    const today = new Date().toLocaleDateString('en-CA', {
      timeZone: timezone,
    });
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toLocaleDateString('en-CA', {
      timeZone: timezone,
    });

    mockDsaModel.countDocuments.mockReturnValue(createQueryResult(4));
    mockDsaModel.aggregate
      .mockResolvedValueOnce([{ _id: today }, { _id: yesterday }])
      .mockResolvedValueOnce([{ _id: today }, { _id: yesterday }])
      .mockReturnValueOnce(
        createQueryResult([{ difficulty: Difficulty.EASY, count: 2 }]),
      )
      .mockReturnValueOnce(
        createQueryResult([{ pattern: DsaPattern.TWO_POINTERS, count: 2 }]),
      )
      .mockReturnValueOnce(createQueryResult([{ _id: today, count: 3 }]));

    const statistics = await service.getStatistics(userId, timezone);

    expect(statistics.totalProblemsSolved).toBe(4);
    expect(statistics.currentStreak).toBe(2);
    expect(statistics.longestStreak).toBe(2);
    expect(statistics.breakdownByDifficulty).toEqual([
      { difficulty: Difficulty.EASY, count: 2 },
    ]);
    expect(statistics.breakdownByPattern).toEqual([
      { pattern: DsaPattern.TWO_POINTERS, count: 2 },
    ]);
    expect(statistics.problemsSolvedOverTime).toHaveLength(14);
    expect(statistics.problemsSolvedOverTime).toContainEqual({
      date: today,
      count: 3,
    });
  });
});
