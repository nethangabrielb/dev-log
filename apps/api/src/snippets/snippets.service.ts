import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Snippet, SnippetDocument } from './schemas/snippets.schema';

@Injectable()
export class SnippetsService {
  constructor(
    @InjectModel(Snippet.name)
    private readonly snippetModel: Model<SnippetDocument>,
  ) {}

  async create(createSnippetDto: CreateSnippetDto, userId: string) {
    return this.snippetModel.create({ ...createSnippetDto, userId });
  }

  async findAll(userId: string) {
    return this.snippetModel.find({ userId }).exec();
  }

  async findOne(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid ID');
    }
    const snippet = await this.snippetModel.findById(id).exec();
    if (!snippet || snippet.userId !== userId) {
      throw new NotFoundException('Snippet not found');
    }
    return snippet;
  }

  async update(id: string, updateSnippetDto: UpdateSnippetDto, userId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid ID');
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
      throw new NotFoundException('Invalid ID');
    }
    const snippet = await this.snippetModel.findById(id).exec();
    if (!snippet || snippet.userId !== userId) {
      throw new NotFoundException('Snippet not found');
    }
    return snippet.deleteOne();
  }
}
