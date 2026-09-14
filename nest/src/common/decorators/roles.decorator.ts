import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';

// https://docs.nestjs.com/guards
export const Roles = Reflector.createDecorator<Role[]>();
