import { IsNumber, IsString, IsUrl, Min } from 'class-validator';

export class UserRegistrationReqDto {
  @IsString()
  username: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  token: string;
}

export class UserEmailPasswordReqDto {
  @IsString()
  email: string;

  @IsString()
  password: string;
}

export class EmailVerificationReqDto {
  @IsString()
  email: string;

  @IsString()
  token: string;
}

export class UserEmailReqDto {
  @IsString()
  email: string;
}

export class UserUsernameReqDto {
  @IsString()
  username: string;
}

export class UserPasswordReqDto {
  @IsString()
  password: string;
}

export class UserAvatarReqDto {
  @IsString()
  @IsUrl()
  avatar: string;
}

export class ReduceCreditReqDto {
  @IsNumber()
  @Min(0)
  amount: number;
}
