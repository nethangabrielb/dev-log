import { Test, TestingModule } from '@nestjs/testing';
import { ArticleCategory, ArticleStatus } from '@devlog/types';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

type MockArticlesService = {
  create: jest.Mock;
  findAll: jest.Mock;
  findOne: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
  getStatistics: jest.Mock;
};

describe('ArticlesController', () => {
  let controller: ArticlesController;
  let service: MockArticlesService;
  const req = {
    user: {
      userId: 'user-1',
    },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        {
          provide: ArticlesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getStatistics: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ArticlesController>(ArticlesController);
    service = module.get(ArticlesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an article through the service', async () => {
    const createArticleDto: CreateArticleDto = {
      url: 'https://example.com/article',
      title: 'Example article',
      category: ArticleCategory.BACKEND,
      status: ArticleStatus.READING,
      tags: ['nestjs'],
    };
    const createdArticle = { id: 'article-1', ...createArticleDto };
    service.create.mockResolvedValue(createdArticle);

    await expect(controller.create(req, createArticleDto)).resolves.toEqual(
      createdArticle,
    );
    expect(service.create).toHaveBeenCalledWith(createArticleDto, 'user-1');
  });

  it('should return articles from the service', async () => {
    const articles = [{ id: 'article-1' }];
    service.findAll.mockResolvedValue(articles);

    await expect(controller.findAll(req)).resolves.toEqual(articles);
    expect(service.findAll).toHaveBeenCalledWith('user-1');
  });

  it('should return article statistics from the service', async () => {
    const statistics = { readRatio: { total: 1, read: 1 } };
    service.getStatistics.mockResolvedValue(statistics);

    await expect(controller.getStatistics(req)).resolves.toEqual(statistics);
    expect(service.getStatistics).toHaveBeenCalledWith('user-1');
  });

  it('should return one article from the service', async () => {
    const article = { id: 'article-1' };
    service.findOne.mockResolvedValue(article);

    await expect(controller.findOne('article-1', req)).resolves.toEqual(
      article,
    );
    expect(service.findOne).toHaveBeenCalledWith('article-1', 'user-1');
  });

  it('should update an article through the service', async () => {
    const updateArticleDto: UpdateArticleDto = {
      status: ArticleStatus.READ,
    };
    const updatedArticle = { id: 'article-1', status: ArticleStatus.READ };
    service.update.mockResolvedValue(updatedArticle);

    await expect(
      controller.update('article-1', updateArticleDto, req),
    ).resolves.toEqual(updatedArticle);
    expect(service.update).toHaveBeenCalledWith(
      'article-1',
      updateArticleDto,
      'user-1',
    );
  });

  it('should remove an article through the service', async () => {
    const removedArticle = { id: 'article-1' };
    service.remove.mockResolvedValue(removedArticle);

    await expect(controller.remove('article-1', req)).resolves.toEqual(
      removedArticle,
    );
    expect(service.remove).toHaveBeenCalledWith('article-1', 'user-1');
  });
});
