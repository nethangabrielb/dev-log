import {
  UseGuards,
  Request,
  Body,
  Controller,
  Post,
  Res,
  HttpCode,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/users.dto';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { UserDocument } from '../users/schemas/users.schema';
import { UsersService } from '../users/users.service';
import bcrypt from 'bcryptjs';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @Post('/register')
  async register(@Body() body: CreateUserDto) {
    // hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);
    body.password = hashedPassword;
    const user = await this.userService.create(body);
    return { success: true, message: 'User registered successfully', user };
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('/login')
  login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const { access_token } = this.authService.login(req.user as UserDocument);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { success: true, message: 'Logged in successfully' };
  }

  @Post('/logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { success: true, message: 'Logged out successfully' };
  }
}
