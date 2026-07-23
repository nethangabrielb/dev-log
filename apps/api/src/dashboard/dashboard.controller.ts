import { Controller, Get, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  findAll(@Req() req: any) {
    const userId = req.user.userId;
    const timezone = req.user.timezone || 'Asia/Manila';
    return this.dashboardService.getDashboardData(userId, timezone);
  }
}
