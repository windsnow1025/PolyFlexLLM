import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BucketItem, Client } from 'minio';
import { Readable } from 'node:stream';
import { AppConfig } from '../config/config.interface';

@Injectable()
export class S3Service implements OnModuleInit {
  private readonly s3Client: Client;
  private readonly config: AppConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<AppConfig>('app')!;
    this.s3Client = new Client({
      endPoint: this.config.s3.host,
      port: this.config.s3.port,
      useSSL: this.config.s3.useSSL,
      accessKey: this.config.s3.accessKey,
      secretKey: this.config.s3.secretKey,
    });
  }

  async onModuleInit() {
    let bucketExists: boolean;
    try {
      bucketExists = await this.s3Client.bucketExists(
        this.config.s3.bucketName,
      );
    } catch (error) {
      console.error('Unable to connect to S3:', (error as Error).message);
      return;
    }

    if (bucketExists) {
      console.log(`Bucket "${this.config.s3.bucketName}" found.`);
      return;
    }

    await this.s3Client.makeBucket(this.config.s3.bucketName);
    console.log(`Bucket "${this.config.s3.bucketName}" created.`);

    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: {
            AWS: ['*'],
          },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.config.s3.bucketName}/*`],
        },
      ],
    };

    await this.s3Client.setBucketPolicy(
      this.config.s3.bucketName,
      JSON.stringify(policy),
    );
    console.log(
      `Bucket policy for "${this.config.s3.bucketName}" set to public.`,
    );
  }

  getWebUrl(): string {
    return this.config.s3.webUrl;
  }

  getFileUrl(fileName: string): string {
    return `${this.config.s3.webUrl}/${this.config.s3.bucketName}/${fileName}`;
  }

  async getTotalSize(prefix: string): Promise<number> {
    const objects = (await this.s3Client
      .listObjects(this.config.s3.bucketName, prefix, true)
      .toArray()) as BucketItem[];
    return objects.reduce((acc, obj) => acc + (obj.size || 0), 0);
  }

  async getObjectSize(fullFilename: string): Promise<number> {
    const stat = await this.s3Client.statObject(
      this.config.s3.bucketName,
      fullFilename,
    );
    return stat.size;
  }

  async uploadFile(
    fullFilename: string,
    buffer: Buffer,
    size: number,
    mimetype: string,
  ): Promise<void> {
    const fileStream = Readable.from(buffer);
    await this.s3Client.putObject(
      this.config.s3.bucketName,
      fullFilename,
      fileStream,
      size,
      {
        'Content-Type': mimetype,
      },
    );
  }

  async copyObject(
    sourceFullFilename: string,
    targetFullFilename: string,
  ): Promise<void> {
    const srcPath = `/${this.config.s3.bucketName}/${sourceFullFilename}`;
    await this.s3Client.copyObject(
      this.config.s3.bucketName,
      targetFullFilename,
      srcPath,
    );
  }

  async listObjects(prefix: string): Promise<string[]> {
    const objects = (await this.s3Client
      .listObjects(this.config.s3.bucketName, prefix, true)
      .toArray()) as BucketItem[];
    return objects.map((object) => object.name!);
  }

  async removeObject(fileName: string): Promise<void> {
    await this.s3Client.removeObject(this.config.s3.bucketName, fileName);
  }
}
