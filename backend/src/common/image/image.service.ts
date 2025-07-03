import {
  Image,
  ImageErrorMessage,
  ImageMessageLog,
  ImageType,
  SavedImageDTO,
  SubjectType,
} from '@common';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ImageRepository } from 'common/image/repositories/image.repository';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);
  constructor(
    private readonly dataSource: DataSource,
    private imageRepo: ImageRepository,
  ) {}

  async saveImage(
    image: SavedImageDTO,
    subjectId: number,
    subjectType: SubjectType,
  ): Promise<Image> {
    return await this.imageRepo.saveImage(image, subjectId, subjectType);
  }

  async saveImages(
    imageList: SavedImageDTO[],
    subjectID: number,
    subjectType: SubjectType,
  ): Promise<Image[]> {
    return await this.imageRepo.saveImages(imageList, subjectID, subjectType);
  }

  async getImageBySubjectIdAndSubjectType(
    subjectID: number,
    subjectType: SubjectType,
  ): Promise<Image> {
    const image: Image | null =
      await this.imageRepo.getImageBySubjectIdAndSubjectType(
        subjectID,
        subjectType,
      );

    if (!image) {
      this.logger.error(ImageMessageLog.IMAGE_NOT_FOUND);
      throw new NotFoundException(ImageErrorMessage.IMAGE_NOT_FOUND);
    }

    return image;
  }

  async findManyById(ids: number[]): Promise<Image[]> {
    return await this.imageRepo.findManyById(ids);
  }

  async updateImageForSubsject(
    dataSource: EntityManager,
    subjectId: number,
    subjectType: string,
    newImageUrl: string,
    imageType: ImageType,
    folder?: string,
  ): Promise<Image> {
    return await this.imageRepo.updateImageForSubsject(
      dataSource,
      subjectId,
      subjectType,
      newImageUrl,
      imageType,
      folder,
    );
  }

  async getImageListBySubjectIdAndSubjectType(
    subjectID: number,
    subjectType: SubjectType,
  ): Promise<Image[]> {
    return await this.imageRepo.getImageListBySubjectIdAndSubjectType(
      subjectID,
      subjectType,
    );
  }
}
