import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { Readable } from 'node:stream';
import { AppConfig } from '../../config/config.interface';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly minioClient: Client;
  private readonly config: AppConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<AppConfig>('app')!;
    this.minioClient = new Client({
      endPoint: this.config.minio.endPoint,
      port: this.config.minio.port,
      useSSL: this.config.minio.useSSL,
      accessKey: this.config.minio.accessKey,
      secretKey: this.config.minio.secretKey,
    });
  }

  async onModuleInit() {
    let bucketExists: boolean;
    try {
      bucketExists = await this.minioClient.bucketExists(
        this.config.minio.bucketName,
      );
    } catch (error) {
      console.error('Unable to connect to MinIO:', error.message);
      return;
    }

    if (bucketExists) {
      console.log(`Bucket "${this.config.minio.bucketName}" found.`);
      return;
    }

    await this.minioClient.makeBucket(this.config.minio.bucketName);
    console.log(`Bucket "${this.config.minio.bucketName}" created.`);

    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: {
            AWS: ['*'],
          },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.config.minio.bucketName}/*`],
        },
      ],
    };

    await this.minioClient.setBucketPolicy(
      this.config.minio.bucketName,
      JSON.stringify(policy),
    );
    console.log(
      `Bucket policy for "${this.config.minio.bucketName}" set to public.`,
    );
  }

  getWebUrl(): string {
    return this.config.minio.webUrl;
  }

  getFileUrl(fileName: string): string {
    return `${this.config.minio.webUrl}/${this.config.minio.bucketName}/${fileName}`;
  }

  async getTotalSize(prefix: string): Promise<number> {
    const objects = await this.minioClient
      .listObjects(this.config.minio.bucketName, prefix, true)
      .toArray();
    return objects.reduce((acc, obj) => acc + (obj.size || 0), 0);
  }

  async getObjectSize(fullFilename: string): Promise<number> {
    const stat = await this.minioClient.statObject(
      this.config.minio.bucketName,
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
    await this.minioClient.putObject(
      this.config.minio.bucketName,
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
    const srcPath = `/${this.config.minio.bucketName}/${sourceFullFilename}`;
    await this.minioClient.copyObject(
      this.config.minio.bucketName,
      targetFullFilename,
      srcPath,
    );
  }

  async listObjects(prefix: string): Promise<string[]> {
    const objects = await this.minioClient
      .listObjects(this.config.minio.bucketName, prefix, true)
      .toArray();
    return objects.map((object) => object.name);
  }

  async removeObject(fileName: string): Promise<void> {
    await this.minioClient.removeObject(this.config.minio.bucketName, fileName);
  }
}
