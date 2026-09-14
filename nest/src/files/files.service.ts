import { Injectable } from '@nestjs/common';
import { S3Service } from './s3.service';

@Injectable()
export class FilesService {
  public readonly maxTotalSize = 256 * 1024 * 1024; // 256MB

  constructor(private readonly s3Service: S3Service) {}

  getWebUrl(): string {
    return this.s3Service.getWebUrl();
  }

  getFileUrl(fullFilename: string): string {
    return this.s3Service.getFileUrl(fullFilename);
  }

  getFileUrls(fullFilenames: string[]): string[] {
    return fullFilenames.map((fileName) => this.getFileUrl(fileName));
  }

  async getUserTotalSize(userId: number): Promise<number> {
    return this.s3Service.getTotalSize(`uploads/${userId}/`);
  }

  async getFilesSize(userId: number, fileNames: string[]): Promise<number> {
    const fullFileNames = fileNames.map(
      (fileName) => `uploads/${userId}/${fileName}`,
    );

    let totalSize = 0;
    for (const fullFileName of fullFileNames) {
      const size = await this.s3Service.getObjectSize(fullFileName);
      totalSize += size;
    }

    return totalSize;
  }

  async createFile(userId: number, file: Express.Multer.File): Promise<string> {
    const originalName = Buffer.from(file.originalname, 'latin1').toString(
      'utf8',
    );
    const filename = `${Date.now()}-${originalName}`;
    const fullFilename = `uploads/${userId}/${filename}`;

    await this.s3Service.uploadFile(
      fullFilename,
      file.buffer,
      file.size,
      file.mimetype,
    );

    return fullFilename;
  }

  async createFiles(
    userId: number,
    files: Array<Express.Multer.File>,
  ): Promise<string[]> {
    return await Promise.all(
      files.map(async (file) => {
        return this.createFile(userId, file);
      }),
    );
  }

  async cloneFile(userId: number, fileName: string): Promise<string> {
    const sourceFullFilename = `uploads/${userId}/${fileName}`;

    const originalFilename = fileName.substring(fileName.indexOf('-') + 1);
    const newFilename = `${Date.now()}-${originalFilename}`;
    const targetFullFilename = `uploads/${userId}/${newFilename}`;

    await this.s3Service.copyObject(sourceFullFilename, targetFullFilename);

    return targetFullFilename;
  }

  async cloneFiles(userId: number, fileNames: string[]): Promise<string[]> {
    const newFullFilenames: string[] = [];

    for (const fileName of fileNames) {
      const destFullName = await this.cloneFile(userId, fileName);
      newFullFilenames.push(destFullName);
    }

    return newFullFilenames;
  }

  async getUserFullFilenames(userId: number): Promise<string[]> {
    return this.s3Service.listObjects(`uploads/${userId}/`);
  }

  async deleteFiles(userId: number, fileNames: string[]): Promise<void> {
    const fullFileNames = fileNames.map(
      (fileName) => `uploads/${userId}/${fileName}`,
    );

    await Promise.all(
      fullFileNames.map(async (fileName) => {
        await this.s3Service.removeObject(fileName);
      }),
    );
  }
}
