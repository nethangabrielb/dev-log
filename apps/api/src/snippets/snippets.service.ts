import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Snippet, SnippetDocument } from './schemas/snippets.schema';
import { PaginationQueryDto } from '../common/pagination-query.dto';
import { buildPaginatedResult } from '../common/pagination.util';

@Injectable()
export class SnippetsService {
  constructor(
    @InjectModel(Snippet.name)
    private readonly snippetModel: Model<SnippetDocument>,
  ) {}

  async create(createSnippetDto: CreateSnippetDto, userId: string) {
    return this.snippetModel.create({ ...createSnippetDto, userId });
  }

  async findAll(userId: string, pagination: Partial<PaginationQueryDto> = {}) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const filter = { userId };
    const [data, total] = await Promise.all([
      this.snippetModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.snippetModel.countDocuments(filter),
    ]);
    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID');
    }
    const snippet = await this.snippetModel.findById(id).exec();
    if (!snippet || snippet.userId !== userId) {
      throw new NotFoundException('Snippet not found');
    }
    return snippet;
  }

  async update(id: string, updateSnippetDto: UpdateSnippetDto, userId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID');
    }
    const snippet = await this.snippetModel.findById(id).exec();
    if (!snippet || snippet.userId !== userId) {
      throw new NotFoundException('Snippet not found');
    }
    Object.assign(snippet, updateSnippetDto);
    return snippet.save();
  }

  async remove(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID');
    }
    const snippet = await this.snippetModel.findById(id).exec();
    if (!snippet || snippet.userId !== userId) {
      throw new NotFoundException('Snippet not found');
    }
    return snippet.deleteOne();
  }
}
