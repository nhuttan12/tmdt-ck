import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { ErrorMessage } from '@message/error-message';

export class GetAllPostReportsRequestDto {
  @ApiPropertyOptional({
    description: 'Số trang của danh sách báo cáo bài viết',
    default: 1,
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: ErrorMessage.PAGE_MUST_BE_INTETER })
  @Min(1, { message: ErrorMessage.PAGE_SHOULD_NOT_A_NEGATIVE_NUMBER })
  page: number;

  @ApiPropertyOptional({
    description: 'Số lượng báo cáo bài viết tối đa trên mỗi trang',
    default: 10,
    type: Number,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: ErrorMessage.LIMIT_MUST_BE_INTETER })
  @Min(10, { message: ErrorMessage.LIMIT_HAVE_AT_LEAST_10 })
  limit: number;
}
