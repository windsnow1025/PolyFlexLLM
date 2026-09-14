import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  _Object,
  CopyObjectCommand,
  CreateBucketCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  NotFound,
  paginateListObjectsV2,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { AppConfig } from '../config/config.interface';

@Injectable()
export class S3Service implements OnModuleInit {
  private readonly s3Client: S3Client;
  private readonly config: AppConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<AppConfig>('app')!;
    this.s3Client = new S3Client({
      endpoint: `${this.config.s3.useSSL ? 'https' : 'http'}://${this.config.s3.host}:${this.config.s3.port}`,
      region: this.config.s3.region,
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.config.s3.accessKey,
        secretAccessKey: this.config.s3.secretKey,
      },
    });
  }

  async onModuleInit() {
    let bucketExists: boolean;
    try {
      bucketExists = await this.bucketExists();
    } catch (error) {
      console.error('Unable to connect to S3:', (error as Error).message);
      return;
    }

    if (bucketExists) {
      console.log(`Bucket "${this.config.s3.bucketName}" found.`);
      return;
    }

    await this.s3Client.send(
      new CreateBucketCommand({ Bucket: this.config.s3.bucketName }),
    );
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

    await this.s3Client.send(
      new PutBucketPolicyCommand({
        Bucket: this.config.s3.bucketName,
        Policy: JSON.stringify(policy),
      }),
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
    const objects = await this.listAllObjects(prefix);
    return objects.reduce((acc, obj) => acc + (obj.Size ?? 0), 0);
  }

  async getObjectSize(fullFilename: string): Promise<number> {
    const head = await this.s3Client.send(
      new HeadObjectCommand({
        Bucket: this.config.s3.bucketName,
        Key: fullFilename,
      }),
    );
    return head.ContentLength!;
  }

  async uploadFile(
    fullFilename: string,
    buffer: Buffer,
    size: number,
    mimetype: string,
  ): Promise<void> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.config.s3.bucketName,
        Key: fullFilename,
        Body: buffer,
        ContentLength: size,
        ContentType: mimetype,
      }),
    );
  }

  async copyObject(
    sourceFullFilename: string,
    targetFullFilename: string,
  ): Promise<void> {
    const encodedSourceFullFilename = encodeURIComponent(
      sourceFullFilename,
    ).replace(/%2F/g, '/');
    await this.s3Client.send(
      new CopyObjectCommand({
        Bucket: this.config.s3.bucketName,
        Key: targetFullFilename,
        CopySource: `${this.config.s3.bucketName}/${encodedSourceFullFilename}`,
      }),
    );
  }

  async listObjects(prefix: string): Promise<string[]> {
    const objects = await this.listAllObjects(prefix);
    return objects.map((object) => object.Key!);
  }

  async removeObject(fileName: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.config.s3.bucketName,
        Key: fileName,
      }),
    );
  }

  private async bucketExists(): Promise<boolean> {
    try {
      await this.s3Client.send(
        new HeadBucketCommand({ Bucket: this.config.s3.bucketName }),
      );
      return true;
    } catch (error) {
      if (error instanceof NotFound) {
        return false;
      }
      throw error;
    }
  }

  private async listAllObjects(prefix: string): Promise<_Object[]> {
    const objects: _Object[] = [];
    const pages = paginateListObjectsV2(
      { client: this.s3Client },
      { Bucket: this.config.s3.bucketName, Prefix: prefix },
    );
    for await (const page of pages) {
      objects.push(...(page.Contents ?? []));
    }
    return objects;
  }
}
