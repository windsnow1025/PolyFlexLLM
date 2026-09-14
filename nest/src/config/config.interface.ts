import { FirebaseOptions } from 'firebase/app';
import { ServiceAccount } from 'firebase-admin';

export interface PostgresConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface MinioConfig {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucketName: string;
  webUrl: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password: string;
}

export interface FirebaseConfig {
  config: FirebaseOptions;
  serviceAccountKey: ServiceAccount;
}

export interface CreemConfig {
  testMode: boolean;
  apiKey: string;
  webhookSecret: string;
  products: Record<string, number>;
}

export interface AppConfig {
  port: number;
  jwtSecret: string;
  postgres: PostgresConfig;
  minio: MinioConfig;
  redis: RedisConfig;
  firebase: FirebaseConfig;
  frontendUrl: string;
  creem: CreemConfig;
}
