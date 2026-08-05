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

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private configService: ConfigService,
  ) {}

  @Public()
  @Post('/register')
  async register(@Body() body: CreateUserDto) {
    if (!body.password) {
      throw new BadRequestException('Password is required');
    }

    // hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);
    body.password = hashedPassword;
    try {
      const user = await this.userService.create(body);
      return { success: true, message: 'User registered successfully', user };
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('User already exists');
      }

      throw error;
    }
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('/login')
  login(@Request() req, @Res({ passthrough: true }) res: Response) {
    this.issueSession(res, req.user as UserDocument);

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
      sameSite: 'lax',
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
