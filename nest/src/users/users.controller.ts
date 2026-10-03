import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { UsersService } from './users.service';
import { UserPrivilegesReqDto } from './dto/user.privileges.req.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import {
  EmailVerificationReqDto,
  ReduceCreditReqDto,
  UserAvatarReqDto,
  UserEmailReqDto,
  UserPasswordReqDto,
  UserSignUpReqDto,
  UserUsernameReqDto,
  VerifiedEmailPasswordReqDto,
  VerifiedEmailReqDto,
} from './dto/user.req.dto';
import { UserResDto } from './dto/user.res.dto';
import { UsersCoreService } from './users.core.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersCoreService: UsersCoreService,
  ) {}

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((user) => this.usersCoreService.toUserDto(user));
  }

  @Get('user')
  find(@Request() req: RequestWithUser): UserResDto {
    return req.user;
  }

  @Public()
  @Post('user')
  async create(@Body() userSignUpReqDto: UserSignUpReqDto) {
    const user = await this.usersService.create(
      userSignUpReqDto.username,
      userSignUpReqDto.email,
      userSignUpReqDto.password,
      userSignUpReqDto.token,
    );
    return this.usersCoreService.toUserDto(user);
  }

  @Public()
  @Post('user/email-verification')
  async sendEmailVerification(
    @Body() emailVerificationReqDto: EmailVerificationReqDto,
  ) {
    await this.usersService.sendEmailVerification(
      emailVerificationReqDto.email,
      emailVerificationReqDto.purpose,
    );
  }

  @Public()
  @Post('user/password-reset-email')
  async sendPasswordResetEmail(@Body() userEmailReqDto: UserEmailReqDto) {
    await this.usersService.sendPasswordResetEmail(userEmailReqDto.email);
  }

  @Public()
  @Put('user/reset-password')
  async updateResetPassword(@Body() reqDto: VerifiedEmailPasswordReqDto) {
    const user = await this.usersService.updateResetPassword(
      reqDto.email,
      reqDto.password,
      reqDto.token,
    );
    return this.usersCoreService.toUserDto(user);
  }

  @Put('user/email')
  async updateEmail(
    @Request() req: RequestWithUser,
    @Body() verifiedEmailReqDto: VerifiedEmailReqDto,
  ): Promise<UserResDto> {
    const id = req.user.id;
    const user = await this.usersService.updateEmail(
      id,
      verifiedEmailReqDto.email,
      verifiedEmailReqDto.token,
    );
    return this.usersCoreService.toUserDto(user);
  }

  @Put('user/username')
  async updateUsername(
    @Request() req: RequestWithUser,
    @Body() userUsernameReqDto: UserUsernameReqDto,
  ): Promise<UserResDto> {
    const id = req.user.id;
    const user = await this.usersService.updateUsername(
      id,
      userUsernameReqDto.username,
    );
    return this.usersCoreService.toUserDto(user);
  }

  @Put('user/password')
  async updatePassword(
    @Request() req: RequestWithUser,
    @Body() userPasswordReqDto: UserPasswordReqDto,
  ) {
    const id = req.user.id;
    const user = await this.usersCoreService.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const newUser = await this.usersService.updatePassword(
      user,
      userPasswordReqDto.password,
    );
    return this.usersCoreService.toUserDto(newUser);
  }

  @Put('user/avatar')
  async updateAvatar(
    @Request() req: RequestWithUser,
    @Body() userAvatarReqDto: UserAvatarReqDto,
  ) {
    const id = req.user.id;
    const user = await this.usersService.updateAvatar(
      id,
      userAvatarReqDto.avatar,
    );
    return this.usersCoreService.toUserDto(user);
  }

  @Put('user/privileges')
  @Roles([Role.Admin])
  async updatePrivileges(@Body() userPrivilegesReqDto: UserPrivilegesReqDto) {
    const user = await this.usersService.updatePrivileges(
      userPrivilegesReqDto.username,
      userPrivilegesReqDto.roles,
      userPrivilegesReqDto.credit,
    );
    return this.usersCoreService.toUserDto(user);
  }

  @Patch('user/reduce-credit')
  async reduceCredit(
    @Request() req: RequestWithUser,
    @Body() reduceCreditReqDto: ReduceCreditReqDto,
  ) {
    const id = req.user.id;
    const user = await this.usersCoreService.adjustCredit(
      id,
      -reduceCreditReqDto.amount,
    );
    return this.usersCoreService.toUserDto(user);
  }

  @Delete('user')
  delete(@Request() req: RequestWithUser) {
    const id = req.user.id;
    return this.usersService.delete(id);
  }

  @Delete('user/:id')
  @Roles([Role.Admin])
  deleteById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.delete(id);
  }

  @Delete('user/firebase')
  @Roles([Role.Admin])
  deleteAllFirebaseUsers() {
    return this.usersService.deleteAllFirebaseUsers();
  }
}
