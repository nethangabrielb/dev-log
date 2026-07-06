import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ProjectCategory, ProjectStatus } from '@devlog/types';
import { ProjectsService } from './projects.service';
import { Project } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

type MockProjectModel = {
  create: jest.Mock;
  find: jest.Mock;
  findById: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  findByIdAndDelete: jest.Mock;
};

describe('ProjectsService', () => {
  let service: ProjectsService;
  let model: MockProjectModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getModelToken(Project.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    model = module.get(getModelToken(Project.name));
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

    await expect(service.create(createProjectDto)).resolves.toEqual(
      createdProject,
    );
    expect(model.create).toHaveBeenCalledWith(createProjectDto);
  });

  it('should return all projects', async () => {
    const projects = [{ id: 'project-1' }, { id: 'project-2' }];
    model.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(projects) });

    await expect(service.findAll()).resolves.toEqual(projects);
    expect(model.find).toHaveBeenCalled();
  });

  it('should return a single project by id', async () => {
    const project = { id: 'project-1' };
    model.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(project),
    });

    await expect(service.findOne(1)).resolves.toEqual(project);
    expect(model.findById).toHaveBeenCalledWith(1);
  });

  it('should update a project by id', async () => {
    const updateProjectDto: UpdateProjectDto = {
      status: ProjectStatus.COMPLETED,
    };
    const updatedProject = { id: 'project-1', status: ProjectStatus.COMPLETED };
    model.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(updatedProject),
    });

    await expect(service.update(1, updateProjectDto)).resolves.toEqual(
      updatedProject,
    );
    expect(model.findByIdAndUpdate).toHaveBeenCalledWith(1, updateProjectDto, {
      new: true,
    });
  });

  it('should remove a project by id', async () => {
    const removedProject = { id: 'project-1' };
    model.findByIdAndDelete.mockReturnValue({
      exec: jest.fn().mockResolvedValue(removedProject),
    });

    await expect(service.remove(1)).resolves.toEqual(removedProject);
    expect(model.findByIdAndDelete).toHaveBeenCalledWith(1);
  });
});
