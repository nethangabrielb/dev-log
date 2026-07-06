import { Injectable } from '@nestjs/common';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Snippet, SnippetDocument } from './schemas/snippets.schema';

@Injectable()
export class SnippetsService {
  constructor(
    @InjectModel(Snippet.name)
    private readonly snippetModel: Model<SnippetDocument>,
  ) {}

  async create(createSnippetDto: CreateSnippetDto) {
    return this.snippetModel.create(createSnippetDto);
  }

  async findAll() {
    return this.snippetModel.find().exec();
  }

  async findOne(id: string) {
    return this.snippetModel.findById(id).exec();
  }

  async update(id: string, updateSnippetDto: UpdateSnippetDto) {
    return this.snippetModel
      .findByIdAndUpdate(id, updateSnippetDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    return this.snippetModel.findByIdAndDelete(id).exec();
  }
}
