import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersCoreService } from '../users/users.core.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from '../users/user.entity';
import { AuthTokenResDto } from './dto/auth.res.dto';

// https://docs.nestjs.com/security/authentication
@Injectable()
export class AuthService {
  constructor(
    private usersCoreService: UsersCoreService,
    private jwtService: JwtService,
  ) {}

  public toAuthTokenDto(token: string) {
    const tokenDto: AuthTokenResDto = {
      accessToken: token,
    };
    return tokenDto;
  }

  async getTokenByEmail(email: string, password: string): Promise<string> {
    const user = await this.usersCoreService.findOneByEmail(email);
    return await this.getToken(user, password);
  }

  async getTokenByUsername(
    username: string,
    password: string,
  ): Promise<string> {
    const user = await this.usersCoreService.findOneByUsername(username);
    return await this.getToken(user, password);
  }

  private async getToken(user: User | null, password: string): Promise<string> {
    if (!user) {
      throw new UnauthorizedException();
    }

    if (!(await this.usersCoreService.verifyPassword(user, password))) {
      throw new UnauthorizedException();
    }

    const payload: JwtPayload = {
      sub: user.id.toString(),
      tokenVersion: user.tokenVersion,
    };
    return await this.jwtService.signAsync(payload);
  }
}
