import { ErrorMessage } from '@message/error-message';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class GetAllCommentRequest {
  @ApiProperty({ description: 'ID bài viết', example: 1 })
  @Type(() => Number)
  @IsInt()
  postId: number;

  @ApiProperty({
    description: 'Số lượng bình luận/trang',
    example: 10,
    required: false,
  })
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: ErrorMessage.PAGE_MUST_BE_INTETER })
  @Min(1, { message: ErrorMessage.PAGE_SHOULD_NOT_A_NEGATIVE_NUMBER })
  page: number;

  @ApiProperty({ description: 'Vị trí bắt đầu', example: 0, required: false })
  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: ErrorMessage.LIMIT_MUST_BE_INTETER })
  @Min(10, { message: ErrorMessage.LIMIT_HAVE_AT_LEAST_10 })
  limit: number;
}
