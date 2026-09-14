import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis, { createKeyv } from '@keyv/redis';
import configuration from '../config/configuration';
import { AppConfig } from '../config/config.interface';
import { AuthGuard } from './common/guards/auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { EmailVerificationGuard } from './common/guards/email-verification.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { ConversationsModule } from './conversations/conversations.module';
import { Conversation } from './conversations/conversation.entity';
import { Announcement } from './announcement/announcement.entity';
import { AnnouncementModule } from './announcement/announcement.module';
import { Prompt } from './prompts/prompt.entity';
import { PromptsModule } from './prompts/prompts.module';
import { Label } from './labels/label.entity';
import { LabelsModule } from './labels/labels.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.get<AppConfig>('app')!;
        return {
          type: 'postgres',
          host: config.postgres.host,
          port: config.postgres.port,
          username: config.postgres.user,
          password: config.postgres.password,
          database: config.postgres.database,
          entities: [User, Conversation, Announcement, Prompt, Label],
          synchronize: true,
          logging: ['query', 'error'],
          logger: 'advanced-console',
        };
      },
    }),
    // https://docs.nestjs.com/techniques/caching
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.get<AppConfig>('app')!;
        const redisUrl = `redis://:${encodeURIComponent(config.redis.password)}@${config.redis.host}:${config.redis.port}`;

        const keyv = createKeyv(redisUrl);
        const redisClient = (keyv.store as KeyvRedis<unknown>).client;

        redisClient.on('error', (error: Error) =>
          console.error('error', error.message),
        );

        keyv.on('error', (error) => {
          console.error('error', error);
        });

        return {
          stores: [keyv],
        };
      },
    }),
    JwtModule,
    CoreModule,
    AuthModule,
    UsersModule,
    FilesModule,
    ConversationsModule,
    AnnouncementModule,
    PromptsModule,
    LabelsModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: EmailVerificationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
