import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { SessionsController } from '../src/sessions/sessions.controller';
import { SessionsService } from '../src/sessions/sessions.service';
import {
  Session,
  SessionSchema,
} from '../src/sessions/schemas/sessions.schema';
import { SessionType, ExportFormat } from '@devlog/types';

dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoUri =
  process.env.MONGODB_URI ||
  'mongodb://nethangabrielb:monkeydl052304@localhost:27017/dev-log?authSource=admin';

describe('Sessions Export Integration Test (Real MongoDB)', () => {
  let module: TestingModule;
  let controller: SessionsController;
  let sessionModel: Model<Session>;

  const testUserId = `user-integration-${Date.now()}`;
  const testTimezone = 'Asia/Manila';

  let session1Doc: any;
  let session2Doc: any;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        MongooseModule.forFeature([
          { name: Session.name, schema: SessionSchema },
        ]),
      ],
      controllers: [SessionsController],
      providers: [SessionsService],
    }).compile();

    controller = module.get<SessionsController>(SessionsController);
    sessionModel = module.get<Model<Session>>(getModelToken(Session.name));

    // Clean up any stale test sessions for this user
    await sessionModel.deleteMany({ userId: testUserId });

    // 1. Session 1: Logged at 11:58 PM Asia/Manila on Jan 1, 2024
    // 2024-01-01T23:58:00+08:00 => 2024-01-01T15:58:00.000Z UTC
    session1Doc = await sessionModel.create({
      userId: testUserId,
      type: SessionType.PROJECT,
      durationInSeconds: 300,
      startedAt: new Date('2024-01-01T15:58:00.000Z'),
      endedAt: new Date('2024-01-01T16:03:00.000Z'),
      todos: [{ name: 'Late night refactor', completed: true }],
    });

    // 2. Session 2: Logged at 12:02 AM Asia/Manila on Jan 2, 2024
    // 2024-01-02T00:02:00+08:00 => 2024-01-01T16:02:00.000Z UTC
    session2Doc = await sessionModel.create({
      userId: testUserId,
      type: SessionType.DSA,
      durationInSeconds: 600,
      startedAt: new Date('2024-01-01T16:02:00.000Z'),
      endedAt: new Date('2024-01-01T16:12:00.000Z'),
      todos: [
        { name: 'Binary Tree Traversal', completed: true },
        { name: 'Graph BFS', completed: false },
      ],
    });
  });

  afterAll(async () => {
    if (sessionModel) {
      await sessionModel.deleteMany({ userId: testUserId });
    }
    if (module) {
      await module.close();
    }
  });

  it('should export only Jan 2 sessions as CSV against real MongoDB (excluding 11:58 PM Jan 1, including 12:02 AM Jan 2)', async () => {
    const mockRes = {
      set: jest.fn(),
    } as any;

    const req = {
      user: {
        userId: testUserId,
        timezone: testTimezone,
      },
    } as any;

    const streamableFile = controller.export(
      {
        format: ExportFormat.CSV,
        startDate: '2024-01-02',
        endDate: '2024-01-02',
      },
      req,
      mockRes,
    );

    expect(mockRes.set).toHaveBeenCalledWith({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="sessions-export.csv"',
    });

    const stream = streamableFile.getStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const rawCsv = Buffer.concat(chunks).toString('utf-8');

    console.log('\n--- RAW EXPORTED CSV OUTPUT ---\n' + rawCsv);

    // Assert Session 1 (11:58 PM Manila on Jan 1) is EXCLUDED
    expect(rawCsv).not.toContain(session1Doc._id.toString());
    expect(rawCsv).not.toContain('Late night refactor');

    // Assert Session 2 (12:02 AM Manila on Jan 2) is INCLUDED with local Manila timestamps
    expect(rawCsv).toContain(session2Doc._id.toString());
    expect(rawCsv).toContain('DSA Problem');
    expect(rawCsv).toContain('2024-01-02 00:02:00,2024-01-02 00:12:00');
    expect(rawCsv).toContain('[x] Binary Tree Traversal; [ ] Graph BFS');
  });

  it('should export only Jan 2 sessions as Markdown against real MongoDB (excluding 11:58 PM Jan 1, including 12:02 AM Jan 2)', async () => {
    const mockRes = {
      set: jest.fn(),
    } as any;

    const req = {
      user: {
        userId: testUserId,
        timezone: testTimezone,
      },
    } as any;

    const streamableFile = controller.export(
      {
        format: ExportFormat.MARKDOWN,
        startDate: '2024-01-02',
        endDate: '2024-01-02',
      },
      req,
      mockRes,
    );

    expect(mockRes.set).toHaveBeenCalledWith({
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': 'attachment; filename="sessions-export.md"',
    });

    const stream = streamableFile.getStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const rawMarkdown = Buffer.concat(chunks).toString('utf-8');

    console.log('\n--- RAW EXPORTED MARKDOWN OUTPUT ---\n' + rawMarkdown);

    // Assert Session 1 (11:58 PM Manila on Jan 1) is EXCLUDED
    expect(rawMarkdown).not.toContain(session1Doc._id.toString());
    expect(rawMarkdown).not.toContain('Late night refactor');

    // Assert Session 2 (12:02 AM Manila on Jan 2) is INCLUDED with local Manila timestamps
    expect(rawMarkdown).toContain(session2Doc._id.toString());
    expect(rawMarkdown).toContain(
      '| DSA Problem | 600 | 2024-01-02 00:02:00 | 2024-01-02 00:12:00 |',
    );
    expect(rawMarkdown).toContain('[x] Binary Tree Traversal; [ ] Graph BFS');
  });

  it('should export 2026-07-13T16:00:00.000Z session as 2026-07-14 00:00:00 in Asia/Manila', async () => {
    const studySession = await sessionModel.create({
      userId: testUserId,
      type: SessionType.STUDY,
      durationInSeconds: 3600,
      startedAt: new Date('2026-07-13T16:00:00.000Z'),
      endedAt: new Date('2026-07-13T17:00:00.000Z'),
      todos: [{ name: 'Read two pointers guide', completed: true }],
    });

    const mockResCsv = { set: jest.fn() } as any;
    const req = {
      user: {
        userId: testUserId,
        timezone: testTimezone,
      },
    } as any;

    const streamableFileCsv = controller.export(
      {
        format: ExportFormat.CSV,
        startDate: '2026-07-14',
        endDate: '2026-07-14',
      },
      req,
      mockResCsv,
    );

    const streamCsv = streamableFileCsv.getStream();
    const chunksCsv: Buffer[] = [];
    for await (const chunk of streamCsv) {
      chunksCsv.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const rawCsv = Buffer.concat(chunksCsv).toString('utf-8');

    console.log(
      '\n--- RAW EXPORTED CSV (Read two pointers guide) ---\n' + rawCsv,
    );

    expect(rawCsv).toContain(studySession._id.toString());
    expect(rawCsv).toContain('Study');
    expect(rawCsv).toContain('2026-07-14 00:00:00,2026-07-14 01:00:00');
    expect(rawCsv).toContain('[x] Read two pointers guide');

    const mockResMd = { set: jest.fn() } as any;
    const streamableFileMd = controller.export(
      {
        format: ExportFormat.MARKDOWN,
        startDate: '2026-07-14',
        endDate: '2026-07-14',
      },
      req,
      mockResMd,
    );

    const streamMd = streamableFileMd.getStream();
    const chunksMd: Buffer[] = [];
    for await (const chunk of streamMd) {
      chunksMd.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const rawMarkdown = Buffer.concat(chunksMd).toString('utf-8');

    console.log(
      '\n--- RAW EXPORTED MARKDOWN (Read two pointers guide) ---\n' +
        rawMarkdown,
    );

    expect(rawMarkdown).toContain(studySession._id.toString());
    expect(rawMarkdown).toContain(
      '| Study | 3600 | 2026-07-14 00:00:00 | 2026-07-14 01:00:00 | [x] Read two pointers guide |',
    );
  });
});
