import {
  UseGuards,
  Request,
  Body,
  Controller,
  Post,
  Get,
  Res,
  HttpCode,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/users.dto';
import { LocalAuthGuard } from './local-auth.guard';
import { GoogleAuthGuard } from './google-auth.guard';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { UserDocument } from '../users/schemas/users.schema';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';
import { Public } from './decorators/public.decorator';
import { normalizeTimezone } from '../common/timezone.util';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private configService: ConfigService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('/register')
  async register(@Body() body: CreateUserDto) {
    if (!body.password) {
      throw new BadRequestException('Password is required');
    }

    // hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);
    body.password = hashedPassword;
    body.timezone = body.timezone
      ? normalizeTimezone(body.timezone)
      : undefined;
    try {
      const user = await this.userService.create(body);
      const { password: _password, ...safeUser } = user.toObject();
      return {
        success: true,
        message: 'User registered successfully',
        user: safeUser,
      };
    } catch (error: any) {
      if (error instanceof Error && 'code' in error && error.code === 11000) {
        throw new ConflictException('User already exists');
      }
      throw error;
    }
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('/login')
  async login(
    @Request() req,
    @Body() body: { timezone?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as UserDocument;

    const timezone = body.timezone
      ? normalizeTimezone(body.timezone)
      : undefined;

    if (timezone && user.timezone !== timezone) {
      await this.userService.updateTimezone(user._id.toString(), timezone);
      user.timezone = timezone;
    }

    this.issueSession(res, user);

    return { success: true, message: 'Logged in successfully' };
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {}

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleAuthRedirect(@Request() req, @Res() res: Response) {
    this.issueSession(res, req.user as UserDocument);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    return res.redirect(`${frontendUrl}/dashboard`);
  }

  private issueSession(res: Response, user: UserDocument) {
    const { access_token } = this.authService.login(user);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  @Post('/logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { success: true, message: 'Logged out successfully' };
  }

  @Get('/profile')
  getProfile(@Request() req) {
    return req.user as UserDocument;
  }
}
