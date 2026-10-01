import { IsString } from 'class-validator';

export class AuthTokenEmailReqDto {
  @IsString()
  email: string;

  @IsString()
  password: string;
}

export class AuthTokenUsernameReqDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}

export class AuthTokenGoogleReqDto {
  @IsString()
  idToken: string;
}
