import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { Roles } from '../decorators/roles.decorator';
import { RequestWithUser } from '../../auth/interfaces/request-with-user.interface';

// https://docs.nestjs.com/guards
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    return matchRoles(roles, user.roles);
  }
}

function matchRoles(requiredRoles: Role[], userRoles: Role[]): boolean {
  if (!userRoles) {
    return false;
  }
  return requiredRoles.some((role) => userRoles.includes(role));
}
