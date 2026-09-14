import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CoreModule } from '../core/core.module';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/config.interface';

// https://docs.nestjs.com/security/authentication
@Module({
  imports: [
    CoreModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const config = configService.get<AppConfig>('app')!;
        return {
          global: true,
          secret: config.jwtSecret,
        };
      },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [],
})
export class AuthModule {}
