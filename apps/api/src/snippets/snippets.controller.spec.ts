import { Test, TestingModule } from '@nestjs/testing';
import { SnippetLanguage, SnippetCategory } from '@devlog/types';
import { SnippetsController } from './snippets.controller';
import { SnippetsService } from './snippets.service';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';

type MockSnippetsService = {
  create: jest.Mock;
  findAll: jest.Mock;
  findOne: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
};

describe('SnippetsController', () => {
  let controller: SnippetsController;
  let service: MockSnippetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SnippetsController],
      providers: [
        {
          provide: SnippetsService,
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

    controller = module.get<SnippetsController>(SnippetsController);
    service = module.get(SnippetsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a snippet through the service', async () => {
    const createSnippetDto: CreateSnippetDto = {
      title: 'Prisma upsert pattern',
      content:
        'await prisma.user.upsert({ where: { id }, update: {}, create: {} })',
      language: SnippetLanguage.TYPESCRIPT,
      category: SnippetCategory.PATTERN,
    };

    const createdSnippet = { id: 'snippet-1', ...createSnippetDto };
    service.create.mockResolvedValue(createdSnippet);

    await expect(controller.create(createSnippetDto)).resolves.toEqual(
      createdSnippet,
    );
    expect(service.create).toHaveBeenCalledWith(createSnippetDto);
  });

  it('should return all snippets from the service', async () => {
    const snippets = [{ id: 'snippet-1' }, { id: 'snippet-2' }];
    service.findAll.mockResolvedValue(snippets);

    await expect(controller.findAll()).resolves.toEqual(snippets);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return a single snippet from the service', async () => {
    const snippet = { id: 'snippet-1' };
    service.findOne.mockResolvedValue(snippet);

    await expect(controller.findOne('snippet-1')).resolves.toEqual(snippet);
    expect(service.findOne).toHaveBeenCalledWith('snippet-1');
  });

  it('should update a snippet through the service', async () => {
    const updateSnippetDto: UpdateSnippetDto = {
      description: 'Added description',
    };
    const updatedSnippet = { id: 'snippet-1', ...updateSnippetDto };
    service.update.mockResolvedValue(updatedSnippet);

    await expect(
      controller.update('snippet-1', updateSnippetDto),
    ).resolves.toEqual(updatedSnippet);
    expect(service.update).toHaveBeenCalledWith('snippet-1', updateSnippetDto);
  });

  it('should remove a snippet through the service', async () => {
    const removedSnippet = { id: 'snippet-1' };
    service.remove.mockResolvedValue(removedSnippet);

    await expect(controller.remove('snippet-1')).resolves.toEqual(
      removedSnippet,
    );
    expect(service.remove).toHaveBeenCalledWith('snippet-1');
  });
});
