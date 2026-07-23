import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Session, SessionSchema } from '../sessions/schemas/sessions.schema';
import { Project, ProjectSchema } from '../projects/schemas/project.schema';
import { Article, ArticleSchema } from '../articles/schema/articles.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  providers: [DashboardService],
  controllers: [DashboardController],
  imports: [
    MongooseModule.forFeature([
      { name: Session.name, schema: SessionSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Article.name, schema: ArticleSchema },
    ]),
  ],
})
export class DashboardModule {}
