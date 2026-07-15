import { Test, TestingModule } from '@nestjs/testing';
import { ProjectCategory, ProjectStatus } from '@devlog/types';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

type MockProjectsService = {
  create: jest.Mock;
  findAll: jest.Mock;
  findOne: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
  getStats: jest.Mock;
};

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: MockProjectsService;
  const req = {
    user: {
      userId: 'user-1',
    },
    query: {
      timezone: 'UTC',
    },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getStats: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get(ProjectsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a project through the service', async () => {
    const createProjectDto: CreateProjectDto = {
      name: 'Dev Log',
      category: ProjectCategory.PERSONAL,
      description: 'A personal dev journal',
      status: ProjectStatus.ACTIVE,
      tags: ['nestjs', 'mongodb'],
    };
    const createdProject = { id: 'project-1', ...createProjectDto };

    service.create.mockResolvedValue(createdProject);

    await expect(controller.create(req, createProjectDto)).resolves.toEqual(
      createdProject,
    );
    expect(service.create).toHaveBeenCalledWith(createProjectDto, 'user-1');
  });

  it('should return all projects from the service', async () => {
    const projects = [{ id: 'project-1' }, { id: 'project-2' }];
    service.findAll.mockResolvedValue(projects);

    await expect(controller.findAll(req)).resolves.toEqual(projects);
    expect(service.findAll).toHaveBeenCalledWith('user-1');
  });

  it('should return a single project from the service', async () => {
    const project = { id: 'project-1' };
    service.findOne.mockResolvedValue(project);

    await expect(controller.findOne(req, '1')).resolves.toEqual(project);
    expect(service.findOne).toHaveBeenCalledWith('1', 'user-1');
  });

  it('should return project stats from the service', async () => {
    const stats = { totalTimeLogged: { totalDuration: 10 } };
    service.getStats.mockResolvedValue(stats);

    await expect(controller.getStats(req, '1')).resolves.toEqual(stats);
    expect(service.getStats).toHaveBeenCalledWith('1', 'user-1', 'UTC');
  });

  it('should update a project through the service', async () => {
    const updateProjectDto: UpdateProjectDto = {
      status: ProjectStatus.COMPLETED,
    };
    const updatedProject = { id: 'project-1', status: ProjectStatus.COMPLETED };

    service.update.mockResolvedValue(updatedProject);

    await expect(
      controller.update(req, '1', updateProjectDto),
    ).resolves.toEqual(updatedProject);
    expect(service.update).toHaveBeenCalledWith(
      '1',
      updateProjectDto,
      'user-1',
    );
  });

  it('should remove a project through the service', async () => {
    const removedProject = { id: 'project-1' };
    service.remove.mockResolvedValue(removedProject);

    await expect(controller.remove(req, '1')).resolves.toEqual(removedProject);
    expect(service.remove).toHaveBeenCalledWith('1', 'user-1');
  });
});
