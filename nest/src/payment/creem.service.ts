import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCreem } from 'creem_io';
import { AppConfig } from '../config/config.interface';

@Injectable()
export class CreemService {
  private readonly config: AppConfig;
  private readonly creem: ReturnType<typeof createCreem>;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<AppConfig>('app')!;
    this.creem = createCreem({
      apiKey: this.config.creem.apiKey,
      webhookSecret: this.config.creem.webhookSecret,
      testMode: this.config.creem.testMode,
    });
  }

  getProducts(): Record<string, number> {
    return this.config.creem.products;
  }

  async createCheckout(
    productId: string,
    metadata: Record<string, number>,
    successUrl: string,
    email: string,
  ): Promise<string> {
    const checkout = await this.creem.checkouts.create({
      productId,
      metadata,
      successUrl,
      customer: { email },
    });

    if (!checkout.checkoutUrl) {
      throw new BadGatewayException('Creem API returned no checkout URL');
    }

    return checkout.checkoutUrl;
  }

  async handleWebhookEvents(
    payload: string,
    signature: string,
    handleCheckout: (
      productPrice: number,
      metadata?: Record<string, number>,
    ) => Promise<void>,
  ): Promise<void> {
    await this.creem.webhooks.handleEvents(payload, signature, {
      onCheckoutCompleted: async (data) => {
        await handleCheckout(
          data.product.price,
          data.metadata as Record<string, number>,
        );
      },
    });
  }
}
