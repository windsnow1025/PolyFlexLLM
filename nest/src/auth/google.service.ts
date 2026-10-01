import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { AppConfig } from '../config/config.interface';

// https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
@Injectable()
export class GoogleService {
  readonly clientId: string;
  private readonly client: OAuth2Client;

  constructor(private readonly configService: ConfigService) {
    const config = this.configService.get<AppConfig>('app')!;
    this.clientId = config.googleClientId;
    this.client = new OAuth2Client();
  }

  async verifyIdToken(idToken: string): Promise<TokenPayload | null> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.clientId,
      });
      return ticket.getPayload() ?? null;
    } catch {
      return null;
    }
  }
}
