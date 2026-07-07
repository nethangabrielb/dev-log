import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateUser(username: string, pass: string): Promise<any> {
    // fetch user
    const user = await this.usersService.findByIdentifier(username);

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
}
