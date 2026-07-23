import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/schemas/users.schema';
import { Session, SessionDocument } from '../sessions/schemas/sessions.schema';
import { DailyReport } from './schema/daily-report.schema';
import { Model } from 'mongoose';

@Injectable()
export class DailyReportService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Session.name) private readonly sessionModel: Model<Session>,
    @InjectModel(DailyReport.name)
    private readonly dailyReportModel: Model<DailyReport>,
  ) {}

  private async getUserSesionsForToday(
    userId: string,
    timezone: string,
  ): Promise<SessionDocument[]> {
    const sessions = await this.sessionModel.aggregate([
      {
        $match: {
          userId,
          $expr: {
            $eq: [
              {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$startedAt',
                  timezone,
                },
              },
              {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: new Date(),
                  timezone,
                },
              },
            ],
          },
        },
      },
    ]);

    return sessions as SessionDocument[];
  }

  async generateDailyReport() {
    // 1. Fetch all users
    const users = await this.userModel.find().exec();

    // 2. For each user:
    await Promise.all(
      users.map(async (user: UserDocument) => {
        // 3. Fetch today's sessions for this user
        const sessions = await this.getUserSesionsForToday(
          user._id.toString(),
          user.timezone || 'Asia/Manila',
        );

        // 4. Skip if no sessions today
        if (!sessions.length) {
          return;
        }
        // 5. Calculate totalTimeLogged (sum of durationInSeconds)
        const totalTimeLogged = sessions.reduce(
          (sum, session) => sum + session.durationInSeconds,
          0,
        );

        // 6. Calculate totalTasksCompleted (sum of tasksCompleted)
        // 6.1 Get the todos that are completed
        const completedTodos = sessions.flatMap((session) =>
          session.todos.filter((todo) => todo.completed),
        ).length;

        // 7. Calculate topSessionType (type with highest total durationInSeconds)
        const topSessionType = sessions.reduce(
          (acc, session) => {
            if (!acc[session.type]) {
              acc[session.type] = 0;
            }
            acc[session.type] += session.durationInSeconds;
            return acc;
          },
          {} as Record<string, number>,
        );

        const topSessionTypeKey = Object.keys(topSessionType).reduce((a, b) =>
          topSessionType[a] > topSessionType[b] ? a : b,
        );

        // 8. Calculate breakdownBySessionType (array of { type, durationInSeconds, tasksCompleted })
        const breakdownBySessionType = Object.values(
          sessions.reduce(
            (acc, session) => {
              if (!acc[session.type]) {
                acc[session.type] = {
                  type: session.type,
                  durationInSeconds: 0,
                  tasksCompleted: 0,
                };
              }
              acc[session.type].durationInSeconds += session.durationInSeconds;
              acc[session.type].tasksCompleted += session.todos.filter(
                (todo) => todo.completed,
              ).length;
              return acc;
            },
            {} as Record<
              string,
              {
                type: string;
                durationInSeconds: number;
                tasksCompleted: number;
              }
            >,
          ),
        );
        // 9. Save the report to the database
        const dailyReport = await this.dailyReportModel.findOneAndUpdate(
          {
            userId: user._id.toString(),
            date: new Date().toLocaleDateString('en-CA', {
              timeZone: user.timezone ?? 'Asia/Manila',
            }),
          },
          {
            totalTimeLogged,
            totalTasksCompleted: completedTodos,
            topSessionType: topSessionTypeKey,
            breakdownBySessionType,
          },
          { upsert: true, new: true },
        );

        return dailyReport;
      }),
    );
  }
}
