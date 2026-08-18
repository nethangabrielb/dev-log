import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './schemas/users.schema';
import { DailyReportScheduler } from '../daily-report/daily-report.scheduler';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: {
    create: jest.Mock;
    findOne: jest.Mock;
    updateOne: jest.Mock;
  };
  let scheduler: {
    upsertUserScheduler: jest.Mock;
    removeUserScheduler: jest.Mock;
  };

  beforeEach(async () => {
    userModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      updateOne: jest.fn(),
    };

    scheduler = {
      upsertUserScheduler: jest.fn().mockResolvedValue(undefined),
      removeUserScheduler: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
        {
          provide: DailyReportScheduler,
          useValue: scheduler,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user and sync daily report scheduler', async () => {
      const mockCreatedUser = {
        _id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        email: 'test@example.com',
        timezone: 'Asia/Manila',
      };
      userModel.create.mockResolvedValue(mockCreatedUser);

      const result = await service.create({
        username: 'testuser',
        email: 'Test@example.com',
        timezone: 'Asia/Manila',
      });

      expect(result).toEqual(mockCreatedUser);
      expect(userModel.create).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        timezone: 'Asia/Manila',
      });
      expect(scheduler.upsertUserScheduler).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        'Asia/Manila',
      );
    });

    it('should create user successfully even if scheduler fails', async () => {
      const mockCreatedUser = {
        _id: '507f1f77bcf86cd799439011',
        username: 'testuser',
      };
      userModel.create.mockResolvedValue(mockCreatedUser);
      scheduler.upsertUserScheduler.mockRejectedValueOnce(
        new Error('Redis down'),
      );

      const result = await service.create({ username: 'testuser' });

      expect(result).toEqual(mockCreatedUser);
    });
  });

  describe('updateTimezone', () => {
    it('should update timezone in DB and sync scheduler', async () => {
      userModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.updateTimezone(
        '507f1f77bcf86cd799439011',
        'America/New_York',
      );

      expect(result).toEqual({ modifiedCount: 1 });
      expect(userModel.updateOne).toHaveBeenCalledWith(
        { _id: '507f1f77bcf86cd799439011' },
        { $set: { timezone: 'America/New_York' } },
      );
      expect(scheduler.upsertUserScheduler).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        'America/New_York',
      );
    });
  });
});
