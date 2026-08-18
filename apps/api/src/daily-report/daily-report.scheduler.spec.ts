import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { getModelToken } from '@nestjs/mongoose';
import { DailyReportScheduler } from './daily-report.scheduler';
import { User } from '../users/schemas/users.schema';

describe('DailyReportScheduler', () => {
  let scheduler: DailyReportScheduler;
  let mockQueue: {
    getJobSchedulers: jest.Mock;
    upsertJobScheduler: jest.Mock;
    removeJobScheduler: jest.Mock;
  };
  let mockUserModel: {
    find: jest.Mock;
  };

  beforeEach(async () => {
    mockQueue = {
      getJobSchedulers: jest.fn(),
      upsertJobScheduler: jest.fn(),
      removeJobScheduler: jest.fn(),
    };

    mockUserModel = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyReportScheduler,
        {
          provide: getQueueToken('daily-report'),
          useValue: mockQueue,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    scheduler = module.get<DailyReportScheduler>(DailyReportScheduler);
  });

  it('should be defined', () => {
    expect(scheduler).toBeDefined();
  });

  describe('syncSchedulers', () => {
    it('should skip writes when schedulers match existing configuration (0 Redis writes)', async () => {
      mockQueue.getJobSchedulers.mockResolvedValue([
        {
          key: 'daily-report:user-1',
          pattern: '0 23 * * *',
          tz: 'Asia/Manila',
        },
      ]);

      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest
              .fn()
              .mockResolvedValue([{ _id: 'user-1', timezone: 'Asia/Manila' }]),
          }),
        }),
      });

      await scheduler.syncSchedulers();

      expect(mockQueue.getJobSchedulers).toHaveBeenCalledTimes(1);
      expect(mockQueue.upsertJobScheduler).not.toHaveBeenCalled();
      expect(mockQueue.removeJobScheduler).not.toHaveBeenCalled();
    });

    it('should upsert when a new user is found in Mongo but missing in Redis', async () => {
      mockQueue.getJobSchedulers.mockResolvedValue([]);

      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest
              .fn()
              .mockResolvedValue([
                { _id: 'user-new', timezone: 'Asia/Manila' },
              ]),
          }),
        }),
      });

      await scheduler.syncSchedulers();

      expect(mockQueue.upsertJobScheduler).toHaveBeenCalledTimes(1);
      expect(mockQueue.upsertJobScheduler).toHaveBeenCalledWith(
        'daily-report:user-new',
        { pattern: '0 23 * * *', tz: 'Asia/Manila' },
        {
          name: 'generate-daily-report',
          data: { userId: 'user-new', timezone: 'Asia/Manila' },
        },
      );
    });

    it('should upsert when an existing user timezone changed', async () => {
      mockQueue.getJobSchedulers.mockResolvedValue([
        {
          key: 'daily-report:user-1',
          pattern: '0 23 * * *',
          tz: 'America/New_York',
        },
      ]);

      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest
              .fn()
              .mockResolvedValue([{ _id: 'user-1', timezone: 'Asia/Tokyo' }]),
          }),
        }),
      });

      await scheduler.syncSchedulers();

      expect(mockQueue.upsertJobScheduler).toHaveBeenCalledTimes(1);
      expect(mockQueue.upsertJobScheduler).toHaveBeenCalledWith(
        'daily-report:user-1',
        { pattern: '0 23 * * *', tz: 'Asia/Tokyo' },
        {
          name: 'generate-daily-report',
          data: { userId: 'user-1', timezone: 'Asia/Tokyo' },
        },
      );
    });

    it('should remove schedulers that no longer exist in Mongo', async () => {
      mockQueue.getJobSchedulers.mockResolvedValue([
        {
          key: 'daily-report:deleted-user',
          pattern: '0 23 * * *',
          tz: 'Asia/Manila',
        },
      ]);

      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await scheduler.syncSchedulers();

      expect(mockQueue.removeJobScheduler).toHaveBeenCalledWith(
        'daily-report:deleted-user',
      );
      expect(mockQueue.upsertJobScheduler).not.toHaveBeenCalled();
    });
  });

  describe('onModuleInit', () => {
    it('should not throw error if syncSchedulers fails', async () => {
      mockQueue.getJobSchedulers.mockRejectedValue(
        new Error('Redis quota exceeded'),
      );

      await expect(scheduler.onModuleInit()).resolves.toBeUndefined();
    });
  });

  describe('single-user helpers', () => {
    it('upsertUserScheduler should schedule a single user immediately', async () => {
      await scheduler.upsertUserScheduler('user-123', 'Asia/Manila');

      expect(mockQueue.upsertJobScheduler).toHaveBeenCalledWith(
        'daily-report:user-123',
        { pattern: '0 23 * * *', tz: 'Asia/Manila' },
        {
          name: 'generate-daily-report',
          data: { userId: 'user-123', timezone: 'Asia/Manila' },
        },
      );
    });

    it('removeUserScheduler should remove the user scheduler from queue', async () => {
      await scheduler.removeUserScheduler('user-123');

      expect(mockQueue.removeJobScheduler).toHaveBeenCalledWith(
        'daily-report:user-123',
      );
    });
  });
});
