import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ProjectCategory, ProjectStatus } from '@devlog/types';
import { ProjectsService } from './projects.service';
import { Project } from './schemas/project.schema';
import { Session } from '../sessions/schemas/sessions.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

const userId = 'user-1';
const timezone = 'Asia/Manila';
const validId = '507f1f77bcf86cd799439011';

const createQueryResult = <T>(value: T) => ({
  exec: jest.fn().mockResolvedValue(value),
});

type MockProjectModel = {
  create: jest.Mock;
  find: jest.Mock;
  findById: jest.Mock;
};

describe('ProjectsService', () => {
  let service: ProjectsService;
  let model: MockProjectModel;
  let sessionModel: { aggregate: jest.Mock };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getModelToken(Project.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: getModelToken(Session.name),
          useValue: {
            aggregate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    model = module.get(getModelToken(Project.name));
    sessionModel = module.get(getModelToken(Session.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a project', async () => {
    const createProjectDto: CreateProjectDto = {
      name: 'Dev Log',
      category: ProjectCategory.PERSONAL,
      description: 'A personal dev journal',
      status: ProjectStatus.ACTIVE,
      tags: ['nestjs', 'mongodb'],
    };
    const createdProject = { id: 'project-1', ...createProjectDto };

    model.create.mockResolvedValue(createdProject);

    await expect(service.create(createProjectDto, userId)).resolves.toEqual(
      createdProject,
    );
    expect(model.create).toHaveBeenCalledWith({ ...createProjectDto, userId });
  });

  it('should return all projects', async () => {
    const projects = [{ id: 'project-1' }, { id: 'project-2' }];
    model.find.mockReturnValue(createQueryResult(projects));

    await expect(service.findAll(userId)).resolves.toEqual(projects);
    expect(model.find).toHaveBeenCalledWith({ userId });
  });

  it('should return a single project by id', async () => {
    const project = { id: 'project-1', userId };
    model.findById.mockReturnValue(createQueryResult(project));

    await expect(service.findOne(validId, userId)).resolves.toEqual(project);
    expect(model.findById).toHaveBeenCalledWith(validId);
  });

  it('should update a project by id', async () => {
    const updateProjectDto: UpdateProjectDto = {
      status: ProjectStatus.COMPLETED,
    };
    const project = {
      id: 'project-1',
      userId,
      save: jest
        .fn()
        .mockResolvedValue({
          id: 'project-1',
          status: ProjectStatus.COMPLETED,
        }),
    };
    model.findById.mockReturnValue(createQueryResult(project));

    await expect(
      service.update(validId, updateProjectDto, userId),
    ).resolves.toEqual({
      id: 'project-1',
      status: ProjectStatus.COMPLETED,
    });
    expect(project.save).toHaveBeenCalled();
  });

  it('should remove a project by id', async () => {
    const project = {
      id: 'project-1',
      userId,
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    };
    model.findById.mockReturnValue(createQueryResult(project));

    await expect(service.remove(validId, userId)).resolves.toEqual({
      deletedCount: 1,
    });
    expect(project.deleteOne).toHaveBeenCalled();
  });

  it('should return project stats', async () => {
    const today = new Date().toLocaleDateString('en-CA', {
      timeZone: timezone,
    });

    model.findById.mockReturnValue(
      createQueryResult({ id: 'project-1', userId }),
    );
    sessionModel.aggregate
      .mockReturnValueOnce(createQueryResult([{ totalDuration: 90 }]))
      .mockResolvedValueOnce([{ totalCompleted: 2 }])
      .mockResolvedValueOnce([{ _id: today, count: 3 }]);

    const stats = await service.getStats(validId, userId, timezone);

    expect(stats.totalTimeLogged).toEqual({ totalDuration: 90 });
    expect(stats.tasksCompleted).toEqual({ totalCompleted: 2 });
    expect(stats.sessionFrequencyOverTime).toHaveLength(14);
    expect(stats.sessionFrequencyOverTime).toContainEqual({
      date: today,
      count: 3,
    });
  });
});
