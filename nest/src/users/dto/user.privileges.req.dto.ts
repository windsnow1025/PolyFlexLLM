import { IsArray, IsEnum, IsNumber, IsString } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class UserPrivilegesReqDto {
  @IsString()
  username: string;

  @IsArray()
  @IsEnum(Role, { each: true })
  roles: Role[];

  @IsNumber()
  credit: number;
}
