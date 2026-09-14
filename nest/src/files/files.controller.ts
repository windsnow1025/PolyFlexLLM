import {
  Body,
  Controller,
  Delete,
  Get,
  PayloadTooLargeException,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { FilesResDto, WebUrlResDto } from './dto/files.res.dto';
import { FilesReqDto } from './dto/files.req.dto';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

const multerOptions: MulterOptions = {
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
};

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('web-url')
  getMinioWebUrl(): WebUrlResDto {
    return { webUrl: this.filesService.getWebUrl() };
  }

  // https://docs.nestjs.com/techniques/file-upload
  @Post()
  @UseInterceptors(AnyFilesInterceptor(multerOptions))
  async uploadFiles(
    @Req() req: RequestWithUser,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const userId = req.user.id;

    const currentTotalSize = await this.filesService.getUserTotalSize(userId);
    const newFilesTotalSize = files.reduce((acc, file) => acc + file.size, 0);

    if (currentTotalSize + newFilesTotalSize > this.filesService.maxTotalSize) {
      throw new PayloadTooLargeException(
        `Total file size limit exceeded. Max allowed: ${this.filesService.maxTotalSize / (1024 * 1024)}MB`,
      );
    }

    const fullFilenames = await this.filesService.createFiles(userId, files);
    const fileUrls = this.filesService.getFileUrls(fullFilenames);

    return { urls: fileUrls };
  }

  @Post('clone')
  async cloneFiles(
    @Req() req: RequestWithUser,
    @Body() cloneFilesReqDto: FilesReqDto,
  ): Promise<FilesResDto> {
    const userId = req.user.id;

    const currentTotalSize = await this.filesService.getUserTotalSize(userId);
    const filesToCloneSize = await this.filesService.getFilesSize(
      userId,
      cloneFilesReqDto.filenames,
    );

    if (currentTotalSize + filesToCloneSize > this.filesService.maxTotalSize) {
      throw new PayloadTooLargeException(
        `Total file size limit exceeded. Max allowed: ${this.filesService.maxTotalSize / (1024 * 1024)}MB`,
      );
    }

    const newFullFilenames = await this.filesService.cloneFiles(
      userId,
      cloneFilesReqDto.filenames,
    );
    const fileUrls = this.filesService.getFileUrls(newFullFilenames);
    return { urls: fileUrls };
  }

  @Get()
  async getFiles(@Req() req: RequestWithUser): Promise<FilesResDto> {
    const userId = req.user.id;

    const fullFilenames = await this.filesService.getUserFullFilenames(userId);
    const fileUrls = this.filesService.getFileUrls(fullFilenames);

    return { urls: fileUrls };
  }

  @Delete('')
  async deleteFiles(
    @Req() req: RequestWithUser,
    @Body() deleteFilesReqDto: FilesReqDto,
  ): Promise<void> {
    const userId = req.user.id;
    await this.filesService.deleteFiles(userId, deleteFilesReqDto.filenames);
  }
}
