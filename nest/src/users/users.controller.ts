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
import { AllowUnverifiedEmail } from '../common/decorators/allow-unverified-email.decorator';
import { Role } from '../common/enums/role.enum';
import {
  ReduceCreditReqDto,
  UserAvatarReqDto,
  UserEmailPasswordReqDto,
  UserEmailReqDto,
  UserPasswordReqDto,
  UserReqDto,
  UserUsernameReqDto,
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

  @AllowUnverifiedEmail()
  @Get('user')
  find(@Request() req: RequestWithUser): UserResDto {
    return req.user;
  }

  @Public()
  @Post('user')
  async create(@Body() userReqDto: UserReqDto) {
    const user = await this.usersService.create(
      userReqDto.username,
      userReqDto.email,
      userReqDto.password,
    );
    return this.usersCoreService.toUserDto(user);
  }

  @AllowUnverifiedEmail()
  @Post('user/email-verification')
  async sendEmailVerification(@Body() userEmailReqDto: UserEmailReqDto) {
    await this.usersService.sendEmailVerification(userEmailReqDto.email);
  }

  @Public()
  @Post('user/password-reset-email')
  async sendPasswordResetEmail(@Body() userEmailReqDto: UserEmailReqDto) {
    await this.usersService.sendPasswordResetEmail(userEmailReqDto.email);
  }

  @AllowUnverifiedEmail()
  @Put('user/email-verified')
  async updateEmailVerified(@Request() req: RequestWithUser) {
    const user = await this.usersCoreService.updateEmailVerified(
      req.user.email,
    );
    return this.usersCoreService.toUserDto(user);
  }

  @Public()
  @Put('user/reset-password')
  async updateResetPassword(@Body() reqDto: UserEmailPasswordReqDto) {
    const user = await this.usersService.updateResetPassword(
      reqDto.email,
      reqDto.password,
    );
    return this.usersCoreService.toUserDto(user);
  }

  @AllowUnverifiedEmail()
  @Put('user/email')
  async updateEmail(
    @Request() req: RequestWithUser,
    @Body() userEmailReqDto: UserEmailReqDto,
  ): Promise<UserResDto> {
    const id = req.user.id;
    const user = await this.usersService.updateEmail(id, userEmailReqDto.email);
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
      userPrivilegesReqDto.emailVerified,
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
