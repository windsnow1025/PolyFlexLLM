import { Role } from '../../common/enums/role.enum';

export class UserResDto {
  id: number;
  username: string;
  email: string;
  hasPassword: boolean;
  roles: Role[];
  avatar?: string;
  credit: number;
}
