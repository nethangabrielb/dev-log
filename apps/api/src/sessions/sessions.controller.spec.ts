import { Test, TestingModule } from '@nestjs/testing';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import {
  CreateSessionDto,
  LinkedToKind,
  SessionType,
} from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

type MockSessionsService = {
  create: jest.Mock;
  findAll: jest.Mock;
  findOne: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
};

describe('SessionsController', () => {
  let controller: SessionsController;
  let service: MockSessionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionsController],
      providers: [
        {
          provide: SessionsService,
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

    controller = module.get<SessionsController>(SessionsController);
    service = module.get(SessionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a session through the service', async () => {
    const createSessionDto: CreateSessionDto = {
      type: SessionType.PROJECT,
      duration: 45,
      startedAt: new Date('2024-01-01T10:00:00.000Z'),
      endedAt: new Date('2024-01-01T10:45:00.000Z'),
      todos: [{ name: 'Write tests', completed: false }],
      linkedTo: { kind: LinkedToKind.PROJECT, id: '507f1f77bcf86cd799439011' },
    };

    const createdSession = { id: 'session-1', ...createSessionDto };
    service.create.mockResolvedValue(createdSession);

    await expect(controller.create(createSessionDto)).resolves.toEqual(
      createdSession,
    );
    expect(service.create).toHaveBeenCalledWith(createSessionDto);
  });

  it('should return all sessions from the service', async () => {
    const sessions = [{ id: 'session-1' }];
    service.findAll.mockResolvedValue(sessions);

    await expect(controller.findAll()).resolves.toEqual(sessions);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return a single session from the service', async () => {
    const session = { id: 'session-1' };
    service.findOne.mockResolvedValue(session);

    await expect(controller.findOne('session-1')).resolves.toEqual(session);
    expect(service.findOne).toHaveBeenCalledWith('session-1');
  });

  it('should update a session through the service', async () => {
    const updateSessionDto: UpdateSessionDto = {
      type: SessionType.STUDY,
      duration: 60,
    };
    const updatedSession = { id: 'session-1', ...updateSessionDto };
    service.update.mockResolvedValue(updatedSession);

    await expect(
      controller.update('session-1', updateSessionDto),
    ).resolves.toEqual(updatedSession);
    expect(service.update).toHaveBeenCalledWith('session-1', updateSessionDto);
  });

  it('should remove a session through the service', async () => {
    const removedSession = { id: 'session-1' };
    service.remove.mockResolvedValue(removedSession);

    await expect(controller.remove('session-1')).resolves.toEqual(
      removedSession,
    );
    expect(service.remove).toHaveBeenCalledWith('session-1');
  });
});
