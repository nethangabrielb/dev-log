import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ArticleCategory, ArticleStatus } from '@devlog/types';
import { ArticlesService } from './articles.service';
import { Article } from './schema/articles.schema';
import { Session } from '../sessions/entities/session.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

const userId = 'user-1';
const validId = '507f1f77bcf86cd799439011';

const createQueryResult = <T>(value: T) => ({
  exec: jest.fn().mockResolvedValue(value),
});

describe('ArticlesService', () => {
  let service: ArticlesService;
  let articleModel: {
    create: jest.Mock;
    find: jest.Mock;
    findById: jest.Mock;
    aggregate: jest.Mock;
  };
  let sessionModel: { aggregate: jest.Mock };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: getModelToken(Article.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            aggregate: jest.fn(),
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

    service = module.get<ArticlesService>(ArticlesService);
    articleModel = module.get(getModelToken(Article.name));
    sessionModel = module.get(getModelToken(Session.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an article', async () => {
    const createArticleDto: CreateArticleDto = {
      url: 'https://example.com/article',
      title: 'Example article',
      category: ArticleCategory.BACKEND,
      status: ArticleStatus.READING,
      tags: ['nestjs'],
    };
    const createdArticle = { id: 'article-1', ...createArticleDto };
    articleModel.create.mockResolvedValue(createdArticle);

    await expect(service.create(createArticleDto, userId)).resolves.toEqual(
      createdArticle,
    );
    expect(articleModel.create).toHaveBeenCalledWith({
      ...createArticleDto,
      userId,
    });
  });

  it('should return all articles for a user', async () => {
    const articles = [{ id: 'article-1' }];
    articleModel.find.mockReturnValue(createQueryResult(articles));

    await expect(service.findAll(userId)).resolves.toEqual(articles);
    expect(articleModel.find).toHaveBeenCalledWith({ userId });
  });

  it('should return a single article for a user', async () => {
    const article = { id: 'article-1', userId };
    articleModel.findById.mockReturnValue(createQueryResult(article));

    await expect(service.findOne(validId, userId)).resolves.toEqual(article);
    expect(articleModel.findById).toHaveBeenCalledWith(validId);
  });

  it('should update an article and set readAt when read', async () => {
    const updateArticleDto: UpdateArticleDto = {
      status: ArticleStatus.READ,
    };
    const article = {
      id: 'article-1',
      userId,
      status: ArticleStatus.READING,
      save: jest
        .fn()
        .mockResolvedValue({ id: 'article-1', status: ArticleStatus.READ }),
    };
    articleModel.findById.mockReturnValue(createQueryResult(article));

    await expect(
      service.update(validId, updateArticleDto, userId),
    ).resolves.toEqual({
      id: 'article-1',
      status: ArticleStatus.READ,
    });
    expect(article.readAt).toBeInstanceOf(Date);
    expect(article.save).toHaveBeenCalled();
  });

  it('should remove an article for a user', async () => {
    const article = {
      id: 'article-1',
      userId,
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    };
    articleModel.findById.mockReturnValue(createQueryResult(article));

    await expect(service.remove(validId, userId)).resolves.toEqual({
      deletedCount: 1,
    });
    expect(article.deleteOne).toHaveBeenCalled();
  });

  it('should return article statistics', async () => {
    const now = new Date();
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();
    const firstDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });

    articleModel.aggregate
      .mockResolvedValueOnce([{ total: 4, read: 3 }])
      .mockResolvedValueOnce([{ _id: firstDayOfMonth, count: 2 }])
      .mockResolvedValueOnce([{ category: ArticleCategory.BACKEND, count: 1 }]);
    sessionModel.aggregate.mockResolvedValue([{ totalDuration: 120 }]);

    const statistics = await service.getStatistics(userId);

    expect(statistics.readRatio).toEqual({ total: 4, read: 3 });
    expect(statistics.readThisMonth).toHaveLength(daysInMonth);
    expect(statistics.readThisMonth).toContainEqual({
      date: firstDayOfMonth,
      count: 2,
    });
    expect(statistics.totalTimeSpentReading).toEqual({ totalDuration: 120 });
    expect(statistics.breakdownByCategory).toEqual([
      { category: ArticleCategory.BACKEND, count: 1 },
    ]);
  });
});
