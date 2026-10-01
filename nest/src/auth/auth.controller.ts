import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import {
  AuthTokenEmailReqDto,
  AuthTokenGoogleReqDto,
  AuthTokenUsernameReqDto,
} from './dto/auth.req.dto';
import { AuthService } from './auth.service';

// https://docs.nestjs.com/security/authentication
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('token/email')
  async createTokenByEmail(@Body() tokenReqDto: AuthTokenEmailReqDto) {
    const token = await this.authService.getTokenByEmail(
      tokenReqDto.email,
      tokenReqDto.password,
    );
    return this.authService.toAuthTokenDto(token);
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('token/username')
  async createTokenByUsername(@Body() tokenReqDto: AuthTokenUsernameReqDto) {
    const token = await this.authService.getTokenByUsername(
      tokenReqDto.username,
      tokenReqDto.password,
    );
    return this.authService.toAuthTokenDto(token);
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('token/google')
  async createTokenByGoogle(@Body() tokenReqDto: AuthTokenGoogleReqDto) {
    const token = await this.authService.getTokenByGoogle(tokenReqDto.idToken);
    return this.authService.toAuthTokenDto(token);
  }

  @Public()
  @Get('google/client-id')
  getGoogleClientId() {
    return this.authService.toGoogleClientIdDto();
  }
}
