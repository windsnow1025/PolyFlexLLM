import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersCoreService } from '../users/users.core.service';
import { CreemService } from './creem.service';
import { ProductResDto } from './dto/payment.res.dto';
import { AppConfig } from '../config/config.interface';

@Injectable()
export class PaymentService {
  private readonly config: AppConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersCoreService: UsersCoreService,
    private readonly creemService: CreemService,
  ) {
    this.config = this.configService.get<AppConfig>('app')!;
  }

  getProducts(): ProductResDto[] {
    const products = this.creemService.getProducts();
    return Object.entries(products).map(([id, credit]) => ({
      id,
      credit,
    }));
  }

  async createCheckout(
    productId: string,
    userId: number,
    email: string,
  ): Promise<string> {
    const successUrl = `${this.config.frontendUrl}/billing/purchase`;
    const metadata = { userId: userId };

    return this.creemService.createCheckout(
      productId,
      metadata,
      successUrl,
      email,
    );
  }

  async handleWebhookEvents(payload: string, signature: string): Promise<void> {
    await this.creemService.handleWebhookEvents(
      payload,
      signature,
      async (productPrice: number, metadata?: Record<string, number>) => {
        if (!metadata?.userId) {
          console.error('Missing userId in webhook metadata');
          throw new BadRequestException('Missing userId in metadata');
        }
        await this.usersCoreService.adjustCredit(
          metadata.userId,
          productPrice / 100,
        );
      },
    );
  }
}
