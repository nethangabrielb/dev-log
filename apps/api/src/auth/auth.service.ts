import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../users/schemas/users.schema';
import { normalizeTimezone } from '../common/timezone.util';
import type { Profile } from 'passport-google-oauth20';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(identifier: string, pass: string): Promise<any> {
    // fetch user
    const user = await this.usersService.findByIdentifier(identifier);

    // check if user exists
    if (!user) {
      return null;
    }

    if (!user.password) {
      return null;
    }

    // check if password matches
    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // exclude password from the returned user object
    const { password: _, ...result } = user.toObject();
    return result;
  }

  login(user: UserDocument) {
    const payload = {
      username: user.username,
      sub: user._id,
      timezone: user.timezone,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateOAuthUser(
    profile: Profile,
    timezone?: string,
  ): Promise<UserDocument | null> {
    const email = profile.emails?.[0]?.value;
    const normalizedTimezone = timezone
      ? normalizeTimezone(timezone)
      : undefined;

    let user = await this.usersService.findByGoogleId(profile.id);
    if (user) {
      if (normalizedTimezone && user.timezone !== normalizedTimezone) {
        await this.usersService.updateTimezone(
          user._id.toString(),
          normalizedTimezone,
        );
        user.timezone = normalizedTimezone;
      }
      return user;
    }

    if (email) {
      user = await this.usersService.findByIdentifier(email);
      if (user) {
        await this.usersService.setGoogleId(user._id.toString(), profile.id);
        if (normalizedTimezone && user.timezone !== normalizedTimezone) {
          await this.usersService.updateTimezone(
            user._id.toString(),
            normalizedTimezone,
          );
          user.timezone = normalizedTimezone;
        }
        return user;
      }

      const username =
        profile.username || email.split('@')[0] || `user_${profile.id}`;
      return this.usersService.create({
        username,
        email,
        timezone: normalizedTimezone,
        provider: 'google',
        googleId: profile.id,
      });
    }

    return null;
  }
}
