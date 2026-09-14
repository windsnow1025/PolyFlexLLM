import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { RequestWithUser } from '../../auth/interfaces/request-with-user.interface';
import { UsersCoreService } from '../../users/users.core.service';
import { AppConfig } from '../../../config/config.interface';

// https://docs.nestjs.com/security/authentication
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly config: AppConfig;

  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
    private usersCoreService: UsersCoreService,
  ) {
    this.config = this.configService.get<AppConfig>('app')!;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // 💡 See this condition
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.config.jwtSecret,
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      const userId = parseInt(payload.sub);
      let user = await this.usersCoreService.findOneById(userId);
      if (!user) {
        throw new UnauthorizedException();
      }
      if (payload.tokenVersion !== user.tokenVersion) {
        throw new UnauthorizedException();
      }
      if (user.email && !user.emailVerified) {
        user = await this.usersCoreService.updateEmailVerified(user.email);
      }
      (request as RequestWithUser).user = this.usersCoreService.toUserDto(user);
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
