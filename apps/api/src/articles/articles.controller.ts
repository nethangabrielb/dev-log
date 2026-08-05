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
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { PaginationQueryDto } from '../common/pagination-query.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  create(@Req() req, @Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.create(createArticleDto, req.user.userId);
  }

  @Get()
  findAll(@Req() req, @Query() pagination: PaginationQueryDto) {
    return this.articlesService.findAll(req.user.userId, pagination);
  }

  @Get('statistics')
  getStatistics(@Req() req) {
    const timezone = req.user.timezone || 'Etc/UTC';
    return this.articlesService.getStatistics(req.user.userId, timezone);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.articlesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @Req() req,
  ) {
    return this.articlesService.update(id, updateArticleDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.articlesService.remove(id, req.user.userId);
  }
}
