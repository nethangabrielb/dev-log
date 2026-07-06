import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SnippetLanguage, SnippetCategory } from '@devlog/types';
import { SnippetsService } from './snippets.service';
import { Snippet } from './schemas/snippets.schema';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';

type MockSnippetModel = {
  create: jest.Mock;
  find: jest.Mock;
  findById: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  findByIdAndDelete: jest.Mock;
};

describe('SnippetsService', () => {
  let service: SnippetsService;
  let model: MockSnippetModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SnippetsService,
        {
          provide: getModelToken(Snippet.name),
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

    service = module.get<SnippetsService>(SnippetsService);
    model = module.get(getModelToken(Snippet.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a snippet', async () => {
    const createSnippetDto: CreateSnippetDto = {
      title: 'Prisma upsert pattern',
      content:
        'await prisma.user.upsert({ where: { id }, update: {}, create: {} })',
      language: SnippetLanguage.TYPESCRIPT,
      category: SnippetCategory.PATTERN,
    };

    const createdSnippet = { id: 'snippet-1', ...createSnippetDto };
    model.create.mockResolvedValue(createdSnippet);

    await expect(service.create(createSnippetDto)).resolves.toEqual(
      createdSnippet,
    );
    expect(model.create).toHaveBeenCalledWith(createSnippetDto);
  });

  it('should return all snippets', async () => {
    const snippets = [{ id: 'snippet-1' }, { id: 'snippet-2' }];
    model.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(snippets) });

    await expect(service.findAll()).resolves.toEqual(snippets);
    expect(model.find).toHaveBeenCalled();
  });

  it('should return a single snippet by id', async () => {
    const snippet = { id: 'snippet-1' };
    model.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(snippet),
    });

    await expect(service.findOne('snippet-1')).resolves.toEqual(snippet);
    expect(model.findById).toHaveBeenCalledWith('snippet-1');
  });

  it('should update a snippet', async () => {
    const updateSnippetDto: UpdateSnippetDto = {
      description: 'Added description',
    };
    const updatedSnippet = { id: 'snippet-1', ...updateSnippetDto };
    model.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(updatedSnippet),
    });

    await expect(
      service.update('snippet-1', updateSnippetDto),
    ).resolves.toEqual(updatedSnippet);
    expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
      'snippet-1',
      updateSnippetDto,
      { new: true },
    );
  });

  it('should remove a snippet', async () => {
    const removedSnippet = { id: 'snippet-1' };
    model.findByIdAndDelete.mockReturnValue({
      exec: jest.fn().mockResolvedValue(removedSnippet),
    });

    await expect(service.remove('snippet-1')).resolves.toEqual(removedSnippet);
    expect(model.findByIdAndDelete).toHaveBeenCalledWith('snippet-1');
  });
});
