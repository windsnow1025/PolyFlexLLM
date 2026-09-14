import * as process from 'node:process';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { registerAs } from '@nestjs/config';
import { FirebaseOptions } from 'firebase/app';
import { ServiceAccount } from 'firebase-admin';
import { AppConfig } from './config.interface';

const loadJsonConfigFile = <T>(filename: string, isProduction: boolean): T => {
  const baseDirectory = isProduction ? '/app/config' : process.cwd();

  const filePath = path.resolve(baseDirectory, filename);

  const fileContent = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContent) as T;
};

// https://docs.nestjs.com/techniques/configuration
export default registerAs('app', (): AppConfig => {
  const isProduction = process.env.ENV !== 'development';
  console.log(`Using ${isProduction ? 'production' : 'development'} setting.`);

  const firebaseConfig = loadJsonConfigFile<FirebaseOptions>(
    'firebaseConfig.json',
    isProduction,
  );
  const serviceAccountKey = loadJsonConfigFile<ServiceAccount>(
    'serviceAccountKey.json',
    isProduction,
  );

  return {
    port: isProduction ? 3000 : 3001,
    jwtSecret: process.env.JWT_SECRET!,
    postgres: {
      host: process.env.POSTGRES_HOST!,
      port: 5432,
      user: process.env.POSTGRES_USER!,
      password: process.env.POSTGRES_PASSWORD!,
      database: process.env.POSTGRES_DB!,
    },
    s3: {
      host: process.env.S3_HOST!,
      port: 9000,
      useSSL: false,
      region: 'us-east-1',
      accessKey: process.env.S3_ACCESS_KEY!,
      secretKey: process.env.S3_SECRET_KEY!,
      bucketName: process.env.S3_BUCKET_NAME!,
      webUrl: process.env.S3_WEB_URL!,
    },
    redis: {
      host: process.env.REDIS_HOST!,
      port: 6379,
      password: process.env.REDIS_PASSWORD!,
    },
    firebase: {
      config: firebaseConfig,
      serviceAccountKey: serviceAccountKey,
    },
    frontendUrl: process.env.FRONTEND_URL!,
    creem: {
      testMode: process.env.CREEM_TEST_MODE === 'true',
      apiKey: process.env.CREEM_API_KEY!,
      webhookSecret: process.env.CREEM_WEBHOOK_SECRET!,
      products: JSON.parse(process.env.CREEM_PRODUCTS!) as Record<
        string,
        number
      >,
    },
  };
});
