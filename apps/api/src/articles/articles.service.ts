import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Model, Types } from 'mongoose';
import { Article } from './schema/articles.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private readonly articleModel: Model<Article>,
  ) {}

  async create(createArticleDto: CreateArticleDto, userId: string) {
    return this.articleModel.create({ ...createArticleDto, userId });
  }

  async findAll(userId: string) {
    return this.articleModel.find({ userId }).exec();
  }

  async findOne(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid ID');
    }
    const article = await this.articleModel.findById(id).exec();
    if (!article || article.userId !== userId) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  async update(id: string, updateArticleDto: UpdateArticleDto, userId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid ID');
    }
    const article = await this.articleModel.findById(id).exec();
    if (!article || article.userId !== userId) {
      throw new NotFoundException('Article not found');
    }
    Object.assign(article, updateArticleDto);
    return article.save();
  }

  async remove(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid ID');
    }
    const article = await this.articleModel.findById(id).exec();
    if (!article || article.userId !== userId) {
      throw new NotFoundException('Article not found');
    }
    return article.deleteOne();
  }
}
