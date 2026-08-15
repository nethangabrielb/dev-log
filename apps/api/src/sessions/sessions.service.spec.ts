import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { getModelToken } from '@nestjs/mongoose';
import { Session } from './schemas/sessions.schema';
import { LinkedToKind, SessionType, ExportFormat } from '@devlog/types';
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
      durationInSeconds: 2700,
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
    mockSessionModel.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(sessions),
          }),
        }),
      }),
    });
    mockSessionModel.countDocuments.mockResolvedValue(2);

    const result = await service.findAll(userId);
    expect(result.data).toEqual(sessions);
    expect(mockSessionModel.find).toHaveBeenCalledWith({ userId });
  });

  it('should export sessions as CSV stream', async () => {
    const sessionDocs = [
      {
        _id: 'session-1',
        type: SessionType.PROJECT,
        durationInSeconds: 3600,
        startedAt: new Date('2024-01-01T10:00:00.000Z'),
        endedAt: new Date('2024-01-01T11:00:00.000Z'),
        todos: [{ name: 'Task 1', completed: true }],
        linkedTo: { kind: LinkedToKind.PROJECT, id: validId },
      },
    ];

    async function* mockCursor() {
      for (const doc of sessionDocs) {
        yield doc;
      }
    }

    mockSessionModel.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        cursor: jest.fn().mockImplementation(mockCursor),
      }),
    });

    const result = service.exportSessions(userId, {
      format: 'csv' as any,
    });

    expect(result.filename).toBe('sessions-export.csv');
    expect(result.contentType).toBe('text/csv; charset=utf-8');

    const chunks: string[] = [];
    for await (const chunk of result.stream) {
      chunks.push(chunk.toString());
    }
    const output = chunks.join('');
    expect(output).toContain('ID,Type,Duration (Seconds),Started At,Ended At,Todos,Linked Kind,Linked ID');
    expect(output).toContain('session-1');
    expect(output).toContain('[x] Task 1');
  });

  it('should export sessions as Markdown table stream', async () => {
    const sessionDocs = [
      {
        _id: 'session-1',
        type: SessionType.DSA,
        durationInSeconds: 1800,
        startedAt: new Date('2024-01-01T10:00:00.000Z'),
        endedAt: new Date('2024-01-01T10:30:00.000Z'),
        todos: [],
      },
    ];

    async function* mockCursor() {
      for (const doc of sessionDocs) {
        yield doc;
      }
    }

    mockSessionModel.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        cursor: jest.fn().mockImplementation(mockCursor),
      }),
    });

    const result = service.exportSessions(userId, {
      format: 'markdown' as any,
      type: SessionType.DSA,
    });

    expect(result.filename).toBe('sessions-export.md');
    expect(result.contentType).toBe('text/markdown; charset=utf-8');

    const chunks: string[] = [];
    for await (const chunk of result.stream) {
      chunks.push(chunk.toString());
    }
    const output = chunks.join('');
    expect(output).toContain('| ID | Type | Duration (s) | Started At | Ended At | Todos | Linked Kind | Linked ID |');
    expect(output).toContain('| session-1 | DSA Problem | 1800 |');
  });

  it('should exclude session logged at 11:58 PM Asia/Manila when export date range covers only next calendar day (Asia/Manila)', async () => {
    // 11:58 PM Asia/Manila on 2024-01-01 = 2024-01-01T15:58:00.000Z (Day 1 in Manila)
    const session1158Pm = {
      _id: 'session-1158pm',
      type: SessionType.PROJECT,
      durationInSeconds: 300,
      startedAt: new Date('2024-01-01T15:58:00.000Z'),
      endedAt: new Date('2024-01-01T16:03:00.000Z'),
      todos: [],
    };

    const allSessions = [session1158Pm];

    mockSessionModel.find.mockImplementation((query: any) => {
      const filtered = allSessions.filter((s) => {
        if (query.startedAt?.$gte && s.startedAt < query.startedAt.$gte) return false;
        if (query.startedAt?.$lte && s.startedAt > query.startedAt.$lte) return false;
        return true;
      });

      return {
        sort: jest.fn().mockReturnValue({
          cursor: jest.fn().mockImplementation(async function* () {
            for (const doc of filtered) {
              yield doc;
            }
          }),
        }),
      };
    });

    const result = service.exportSessions(
      userId,
      {
        format: ExportFormat.CSV,
        startDate: '2024-01-02',
        endDate: '2024-01-02',
      },
      'Asia/Manila',
    );

    const chunks: string[] = [];
    for await (const chunk of result.stream) {
      chunks.push(chunk.toString());
    }
    const output = chunks.join('');

    expect(output).not.toContain('session-1158pm');
    expect(mockSessionModel.find).toHaveBeenCalledWith({
      userId,
      startedAt: {
        $gte: new Date('2024-01-01T16:00:00.000Z'),
        $lte: new Date('2024-01-02T15:59:59.999Z'),
      },
    });
  });

  it('should include session logged at 12:02 AM Asia/Manila when export date range covers that calendar day (Asia/Manila)', async () => {
    // 12:02 AM Asia/Manila on 2024-01-02 = 2024-01-01T16:02:00.000Z (Day 2 in Manila)
    const session1202Am = {
      _id: 'session-1202am',
      type: SessionType.DSA,
      durationInSeconds: 600,
      startedAt: new Date('2024-01-01T16:02:00.000Z'),
      endedAt: new Date('2024-01-01T16:12:00.000Z'),
      todos: [{ name: 'Solve problem', completed: true }],
    };

    const allSessions = [session1202Am];

    mockSessionModel.find.mockImplementation((query: any) => {
      const filtered = allSessions.filter((s) => {
        if (query.startedAt?.$gte && s.startedAt < query.startedAt.$gte) return false;
        if (query.startedAt?.$lte && s.startedAt > query.startedAt.$lte) return false;
        return true;
      });

      return {
        sort: jest.fn().mockReturnValue({
          cursor: jest.fn().mockImplementation(async function* () {
            for (const doc of filtered) {
              yield doc;
            }
          }),
        }),
      };
    });

    const result = service.exportSessions(
      userId,
      {
        format: ExportFormat.CSV,
        startDate: '2024-01-02',
        endDate: '2024-01-02',
      },
      'Asia/Manila',
    );

    const chunks: string[] = [];
    for await (const chunk of result.stream) {
      chunks.push(chunk.toString());
    }
    const output = chunks.join('');

    expect(output).toContain('session-1202am');
    expect(output).toContain('Solve problem');
    expect(mockSessionModel.find).toHaveBeenCalledWith({
      userId,
      startedAt: {
        $gte: new Date('2024-01-01T16:00:00.000Z'),
        $lte: new Date('2024-01-02T15:59:59.999Z'),
      },
    });
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

  it('should return continuous daily activity array with zero-filled inactive days', async () => {
    const today = new Date().toLocaleDateString('en-CA', {
      timeZone: timezone,
    });

    mockSessionModel.aggregate.mockResolvedValueOnce([
      { _id: today, count: 2, totalDuration: 3600 },
    ]);

    const activity = await service.getDailyActivity(userId, timezone, 7);

    expect(activity).toHaveLength(7);
    const todayEntry = activity.find((a) => a.date === today);
    expect(todayEntry).toEqual({
      date: today,
      count: 2,
      totalDuration: 3600,
    });

    const inactiveEntries = activity.filter((a) => a.date !== today);
    expect(inactiveEntries.every((a) => a.count === 0 && a.totalDuration === 0)).toBe(true);
  });
});
