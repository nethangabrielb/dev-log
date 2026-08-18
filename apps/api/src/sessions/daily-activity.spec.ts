import { generateZonedDateList } from '../common/timezone.util';

export interface DailyActivityItem {
  date: string;
  count: number;
  totalDuration: number;
}

export async function getDailyActivity(
  sessionModel: { aggregate: jest.Mock },
  userId: string,
  timezone: string,
  daysCount: number = 365,
  referenceDate: Date = new Date(),
): Promise<DailyActivityItem[]> {
  const { dateList, startDateUtc } = generateZonedDateList(
    timezone,
    daysCount,
    referenceDate,
  );

  const results: Array<{ _id: string; count: number; totalDuration: number }> =
    await sessionModel.aggregate([
      {
        $match: {
          userId,
          startedAt: { $gte: startDateUtc },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$startedAt',
              timezone,
            },
          },
          count: { $sum: 1 },
          totalDuration: { $sum: '$durationInSeconds' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

  const resultMap = new Map(
    results.map((r) => [
      r._id,
      { count: r.count, totalDuration: r.totalDuration },
    ]),
  );

  return dateList.map((date) => ({
    date,
    count: resultMap.get(date)?.count ?? 0,
    totalDuration: resultMap.get(date)?.totalDuration ?? 0,
  }));
}

describe('getDailyActivity timezone alignment (Asia/Manila)', () => {
  const timezone = 'Asia/Manila';
  const userId = 'user-test-manila';

  it('should generate exact UTC start boundary matching midnight Asia/Manila', () => {
    // Reference date: 2026-08-15T04:00:00.000Z (which is 2026-08-15 12:00:00 in Asia/Manila)
    const refDate = new Date('2026-08-15T04:00:00.000Z');
    const daysCount = 7;

    const { dateList, startDateUtc } = generateZonedDateList(
      timezone,
      daysCount,
      refDate,
    );

    // 7 days ending on 2026-08-15: 2026-08-09, 10, 11, 12, 13, 14, 15
    expect(dateList).toEqual([
      '2026-08-09',
      '2026-08-10',
      '2026-08-11',
      '2026-08-12',
      '2026-08-13',
      '2026-08-14',
      '2026-08-15',
    ]);

    // 2026-08-09 00:00:00 Asia/Manila (UTC+8) is 2026-08-08 16:00:00 UTC
    expect(startDateUtc.toISOString()).toBe('2026-08-08T16:00:00.000Z');
  });

  it('should correctly handle UTC date rollover into Manila next day', () => {
    // 2026-08-14T20:00:00.000Z is 2026-08-15 04:00:00 in Asia/Manila
    const refDate = new Date('2026-08-14T20:00:00.000Z');
    const daysCount = 3;

    const { dateList, startDateUtc } = generateZonedDateList(
      timezone,
      daysCount,
      refDate,
    );

    // In Manila, today is already Aug 15!
    expect(dateList).toEqual(['2026-08-13', '2026-08-14', '2026-08-15']);
    // Aug 13 00:00:00 Manila = Aug 12 16:00:00 UTC
    expect(startDateUtc.toISOString()).toBe('2026-08-12T16:00:00.000Z');
  });

  it('should align zero-filled date sequence with MongoDB $dateToString aggregation results for Asia/Manila', async () => {
    const refDate = new Date('2026-08-15T02:00:00.000Z'); // 10:00 AM Manila on 2026-08-15
    const daysCount = 5; // 2026-08-11 to 2026-08-15

    // Simulated MongoDB aggregation output with $dateToString timezone: 'Asia/Manila'
    const mockAggregationResults = [
      { _id: '2026-08-11', count: 2, totalDuration: 3600 },
      { _id: '2026-08-13', count: 1, totalDuration: 1800 },
      { _id: '2026-08-15', count: 4, totalDuration: 7200 },
    ];

    const mockSessionModel = {
      aggregate: jest.fn().mockResolvedValue(mockAggregationResults),
    };

    const activity = await getDailyActivity(
      mockSessionModel,
      userId,
      timezone,
      daysCount,
      refDate,
    );

    // Verify aggregation query parameters
    expect(mockSessionModel.aggregate).toHaveBeenCalledWith([
      {
        $match: {
          userId,
          startedAt: { $gte: new Date('2026-08-10T16:00:00.000Z') }, // 2026-08-11 00:00 Manila
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$startedAt',
              timezone: 'Asia/Manila',
            },
          },
          count: { $sum: 1 },
          totalDuration: { $sum: '$durationInSeconds' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Verify returned 5-day continuous list with zeros on inactive days (Aug 12 and Aug 14)
    expect(activity).toEqual([
      { date: '2026-08-11', count: 2, totalDuration: 3600 },
      { date: '2026-08-12', count: 0, totalDuration: 0 },
      { date: '2026-08-13', count: 1, totalDuration: 1800 },
      { date: '2026-08-14', count: 0, totalDuration: 0 },
      { date: '2026-08-15', count: 4, totalDuration: 7200 },
    ]);
  });
});
