import { Injectable } from '@nestjs/common';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';

@Injectable()
export class SnippetsService {
  create(createSnippetDto: CreateSnippetDto) {
    return 'This action adds a new snippet';
  }

  findAll() {
    return `This action returns all snippets`;
  }

  findOne(id: number) {
    return `This action returns a #${id} snippet`;
  }

  update(id: number, updateSnippetDto: UpdateSnippetDto) {
    return `This action updates a #${id} snippet`;
  }

  remove(id: number) {
    return `This action removes a #${id} snippet`;
  }
}
