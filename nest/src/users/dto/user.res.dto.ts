import { Role } from '../../common/enums/role.enum';

export class UserResDto {
  id: number;
  username: string;
  email: string;
  roles: Role[];
  avatar?: string;
  credit: number;
}

export class EmailVerificationResDto {
  token: string;
}
