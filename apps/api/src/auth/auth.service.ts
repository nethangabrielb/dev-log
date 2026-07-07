import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../users/schemas/users.schema';

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
    const payload = { username: user.username, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
