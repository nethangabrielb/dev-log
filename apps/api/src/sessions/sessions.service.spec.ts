import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { getModelToken } from '@nestjs/mongoose';
import { Session } from './schemas/sessions.schema';
import { LinkedToKind, SessionType } from '@devlog/types';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

const userId = 'user-1';
const timezone = 'Asia/Manila';
const validId = '507f1f77bcf86cd799439011';

const createQueryResult = <T>(value: T) => ({
  exec: jest.fn().mockResolvedValue(value),
});

describe('SessionsService', () => {
  let service: SessionsService;

  const mockSessionModel: any = jest.fn();
  mockSessionModel.find = jest.fn();
  mockSessionModel.findById = jest.fn();
  mockSessionModel.aggregate = jest.fn();
  mockSessionModel.countDocuments = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: getModelToken(Session.name),
          useValue: mockSessionModel,
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a session', async () => {
    const createSessionDto: CreateSessionDto = {
      type: SessionType.PROJECT,
      durationInSeconds: 45,
      startedAt: new Date('2024-01-01T10:00:00.000Z'),
      endedAt: new Date('2024-01-01T10:45:00.000Z'),
      todos: [{ name: 'Write tests', completed: false }],
      linkedTo: { kind: LinkedToKind.PROJECT, id: validId },
    };
    const createdSession = { id: 'session-1', ...createSessionDto, userId };

    mockSessionModel.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(createdSession),
    }));

    await expect(service.create(createSessionDto, userId)).resolves.toEqual(
      createdSession,
    );
    expect(mockSessionModel).toHaveBeenCalledWith({
      ...createSessionDto,
      userId,
    });
  });

  it('should return all sessions for a user', async () => {
    const sessions = [{ id: 'session-1' }, { id: 'session-2' }];
    mockSessionModel.find.mockReturnValue(createQueryResult(sessions));

    await expect(service.findAll(userId)).resolves.toEqual(sessions);
    expect(mockSessionModel.find).toHaveBeenCalledWith({ userId });
  });

  it('should return a single session by id for a user', async () => {
    const session = { id: 'session-1', userId };
    mockSessionModel.findById.mockReturnValue(createQueryResult(session));

    await expect(service.findOne(validId, userId)).resolves.toEqual(session);
    expect(mockSessionModel.findById).toHaveBeenCalledWith(validId);
  });

  it('should update a session by id for a user', async () => {
    const updateSessionDto: UpdateSessionDto = {
      type: SessionType.STUDY,
      durationInSeconds: 60,
    };
    const session = {
      id: 'session-1',
      userId,
      save: jest
        .fn()
        .mockResolvedValue({ id: 'session-1', ...updateSessionDto }),
    };

    mockSessionModel.findById.mockReturnValue(createQueryResult(session));

    await expect(
      service.update(validId, updateSessionDto, userId),
    ).resolves.toEqual({
      id: 'session-1',
      ...updateSessionDto,
    });
    expect(session.save).toHaveBeenCalled();
  });

  it('should remove a session by id for a user', async () => {
    const session = {
      id: 'session-1',
      userId,
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    };

    mockSessionModel.findById.mockReturnValue(createQueryResult(session));

    await expect(service.remove(validId, userId)).resolves.toEqual({
      deletedCount: 1,
    });
    expect(session.deleteOne).toHaveBeenCalled();
  });

  it('should return streaks for every session type', async () => {
    const today = new Date().toLocaleDateString('en-CA', {
      timeZone: timezone,
    });
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toLocaleDateString('en-CA', {
      timeZone: timezone,
    });

    mockSessionModel.aggregate.mockResolvedValue([
      { _id: today },
      { _id: yesterday },
    ]);

    await expect(service.getStreaks(userId, timezone)).resolves.toEqual(
      Object.values(SessionType).map((type) => ({
        type,
        currentStreak: 2,
        longestStreak: 2,
      })),
    );
  });

  it('should return session statistics', async () => {
    const today = new Date().toLocaleDateString('en-CA', {
      timeZone: timezone,
    });
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toLocaleDateString('en-CA', {
      timeZone: timezone,
    });

    mockSessionModel.aggregate
      .mockResolvedValueOnce([
        { _id: SessionType.PROJECT, totalDuration: 120 },
        { _id: SessionType.STUDY, totalDuration: 60 },
      ])
      .mockResolvedValueOnce([{ _id: null, averageDuration: 90 }])
      .mockResolvedValueOnce([{ _id: today, totalDuration: 120 }])
      .mockResolvedValueOnce([{ _id: null, totalDuration: 180 }])
      .mockResolvedValueOnce([{ _id: today, count: 3 }])
      .mockResolvedValueOnce([{ _id: today }, { _id: yesterday }]);
    mockSessionModel.countDocuments.mockResolvedValue(4);

    const statistics = await service.getStatistics(userId, timezone);

    expect(statistics.totalByType).toEqual([
      { _id: SessionType.PROJECT, totalDuration: 120 },
      { _id: SessionType.STUDY, totalDuration: 60 },
    ]);
    expect(statistics.averagePerDay).toEqual({
      _id: null,
      averageDuration: 90,
    });
    expect(statistics.mostProductiveDay).toEqual({
      _id: today,
      totalDuration: 120,
    });
    expect(statistics.totalTimeSpent).toEqual({
      _id: null,
      totalDuration: 180,
    });
    expect(statistics.totalSessions).toBe(4);
    expect(statistics.sessionCountOverTime).toHaveLength(14);
    expect(statistics.sessionCountOverTime).toContainEqual({
      date: today,
      count: 3,
    });
    expect(statistics.currentStreak).toBe(2);
  });
});
