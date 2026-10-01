import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersCoreService } from '../users/users.core.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from '../users/user.entity';
import { AuthGoogleClientIdResDto, AuthTokenResDto } from './dto/auth.res.dto';
import { GoogleService } from './google.service';

// https://docs.nestjs.com/security/authentication
@Injectable()
export class AuthService {
  constructor(
    private usersCoreService: UsersCoreService,
    private jwtService: JwtService,
    private googleService: GoogleService,
  ) {}

  public toAuthTokenDto(token: string) {
    const tokenDto: AuthTokenResDto = {
      accessToken: token,
    };
    return tokenDto;
  }

  public toGoogleClientIdDto() {
    const clientIdDto: AuthGoogleClientIdResDto = {
      clientId: this.googleService.clientId,
    };
    return clientIdDto;
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

  async getTokenByGoogle(idToken: string): Promise<string> {
    const payload = await this.googleService.verifyIdToken(idToken);
    if (!payload || !payload.email || !payload.email_verified) {
      throw new UnauthorizedException();
    }

    const user = await this.usersCoreService.findOrCreateByGoogle(
      payload.sub,
      payload.email,
      payload.picture,
    );
    return await this.signToken(user);
  }

  private async getToken(user: User | null, password: string): Promise<string> {
    if (!user) {
      throw new UnauthorizedException();
    }

    if (!(await this.usersCoreService.verifyPassword(user, password))) {
      throw new UnauthorizedException();
    }

    return await this.signToken(user);
  }

  private async signToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id.toString(),
      tokenVersion: user.tokenVersion,
    };
    return await this.jwtService.signAsync(payload);
  }
}
