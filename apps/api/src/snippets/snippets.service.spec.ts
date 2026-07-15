import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SnippetLanguage, SnippetCategory } from '@devlog/types';
import { SnippetsService } from './snippets.service';
import { Snippet } from './schemas/snippets.schema';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';

const userId = 'user-1';
const validId = '507f1f77bcf86cd799439011';

const createQueryResult = <T>(value: T) => ({
  exec: jest.fn().mockResolvedValue(value),
});

type MockSnippetModel = {
  create: jest.Mock;
  find: jest.Mock;
  findById: jest.Mock;
};

describe('SnippetsService', () => {
  let service: SnippetsService;
  let model: MockSnippetModel;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SnippetsService,
        {
          provide: getModelToken(Snippet.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
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

    await expect(service.create(createSnippetDto, userId)).resolves.toEqual(
      createdSnippet,
    );
    expect(model.create).toHaveBeenCalledWith({ ...createSnippetDto, userId });
  });

  it('should return all snippets', async () => {
    const snippets = [{ id: 'snippet-1' }, { id: 'snippet-2' }];
    model.find.mockReturnValue(createQueryResult(snippets));

    await expect(service.findAll(userId)).resolves.toEqual(snippets);
    expect(model.find).toHaveBeenCalledWith({ userId });
  });

  it('should return a single snippet by id', async () => {
    const snippet = { id: 'snippet-1', userId };
    model.findById.mockReturnValue(createQueryResult(snippet));

    await expect(service.findOne(validId, userId)).resolves.toEqual(snippet);
    expect(model.findById).toHaveBeenCalledWith(validId);
  });

  it('should update a snippet', async () => {
    const updateSnippetDto: UpdateSnippetDto = {
      description: 'Added description',
    };
    const snippet = {
      id: 'snippet-1',
      userId,
      save: jest
        .fn()
        .mockResolvedValue({ id: 'snippet-1', ...updateSnippetDto }),
    };
    model.findById.mockReturnValue(createQueryResult(snippet));

    await expect(
      service.update(validId, updateSnippetDto, userId),
    ).resolves.toEqual({ id: 'snippet-1', ...updateSnippetDto });
    expect(snippet.save).toHaveBeenCalled();
  });

  it('should remove a snippet', async () => {
    const snippet = {
      id: 'snippet-1',
      userId,
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    };
    model.findById.mockReturnValue(createQueryResult(snippet));

    await expect(service.remove(validId, userId)).resolves.toEqual({
      deletedCount: 1,
    });
    expect(snippet.deleteOne).toHaveBeenCalled();
  });
});
