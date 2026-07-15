import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Req() req: any, @Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto, req.user.userId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.projectsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.projectsService.findOne(id, userId);
  }

  @Get(':id/stats')
  getStats(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    const timezone = req.query.timezone || 'Asia/Manila';
    return this.projectsService.getStats(id, userId, timezone);
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    const userId = req.user.userId;
    return this.projectsService.update(id, updateProjectDto, userId);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.projectsService.remove(id, userId);
  }
}
