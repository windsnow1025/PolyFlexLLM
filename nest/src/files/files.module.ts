import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { S3Service } from './s3.service';

@Module({
  providers: [FilesService, S3Service],
  controllers: [FilesController],
  exports: [],
})
export class FilesModule {}
