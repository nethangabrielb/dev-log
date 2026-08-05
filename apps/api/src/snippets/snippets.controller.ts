import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { SnippetsService } from './snippets.service';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';
import { PaginationQueryDto } from '../common/pagination-query.dto';

@Controller('snippets')
export class SnippetsController {
  constructor(private readonly snippetsService: SnippetsService) {}

  @Post()
  create(@Req() req, @Body() createSnippetDto: CreateSnippetDto) {
    return this.snippetsService.create(createSnippetDto, req.user.userId);
  }

  @Get()
  findAll(@Req() req, @Query() pagination: PaginationQueryDto) {
    return this.snippetsService.findAll(req.user.userId, pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.snippetsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSnippetDto: UpdateSnippetDto,
    @Req() req,
  ) {
    return this.snippetsService.update(id, updateSnippetDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.snippetsService.remove(id, req.user.userId);
  }
}
