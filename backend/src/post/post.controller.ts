import { JwtPayload } from '@auth';
import { ApiResponse, CatchEverythingFilter, GetUser, HasRole, JwtAuthGuard, RolesGuard } from '@common';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiResponse as SwaggerApiResponse,
} from '@nestjs/swagger';
import {
  CreatePostRequestDto,
  DeletePostRequestDto,
  EditPostRequestDto,
  GetAllPostReportsRequestDto,
  GetAllPostsRequestDto,
  PostNotifyMessage,
  PostReportResponseDto,
  PostResponse,
  PostService,
  ReportPostDto,
  SendRequestChangingPostDto,
} from '@post';
import { RoleName } from '@role';

@Controller('/post')
@ApiTags('Post')
@ApiBearerAuth('jwt')
@HasRole(RoleName.USER, RoleName.ADMIN)
@UseFilters(CatchEverythingFilter)
export class PostController {
  private readonly logger = new Logger(PostController.name);
  constructor(private readonly postService: PostService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách bài viết (phân trang)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng bài viết mỗi trang',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Trang số',
  })
  @SwaggerApiResponse({
    status: 200,
    description: PostNotifyMessage.GET_POST_SUCCESSFUL,
  })
  async getAllPosts(
    @Query() request: GetAllPostsRequestDto,
  ): Promise<ApiResponse<PostResponse[]>> {
    const posts = await this.postService.getAllPosts(request);
    return {
      statusCode: HttpStatus.OK,
      message: PostNotifyMessage.GET_POST_SUCCESSFUL,
      data: posts,
    };
  }

  @Post('/create')
  @ApiOperation({ summary: 'Tạo bài viết mới' })
  @ApiBody({ type: CreatePostRequestDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SwaggerApiResponse({
    status: 201,
    description: PostNotifyMessage.CREATE_POST_SUCCESSFUL,
  })
  async createPost(
    @GetUser() authorId: JwtPayload,
    @Body() dto: CreatePostRequestDto,
  ): Promise<ApiResponse<PostResponse>> {
    this.logger.debug(`Author: ${JSON.stringify(authorId)}`);
    const post = await this.postService.createPost(authorId.sub, dto);
    this.logger.debug(`Post: ${JSON.stringify(post)}`);

    return {
      statusCode: HttpStatus.CREATED,
      message: PostNotifyMessage.CREATE_POST_SUCCESSFUL,
      data: post,
    };
  }

  @Patch('edit/:postId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Chỉnh sửa bài viết' })
  @ApiParam({ name: 'postId', type: Number, description: 'ID bài viết' })
  @ApiBody({ type: EditPostRequestDto })
  @SwaggerApiResponse({
    status: 200,
    description: PostNotifyMessage.UPDATE_POST_SUCCESSFUL,
  })
  async editPost(
    @Param('postId', ParseIntPipe) postId: number,
    @GetUser() user: JwtPayload,
    @Body() editPostDto: EditPostRequestDto,
  ): Promise<ApiResponse<PostResponse>> {
    const post = await this.postService.editPost(user.sub, editPostDto);
    this.logger.debug(`Post: ${JSON.stringify(post)}`);

    return {
      statusCode: HttpStatus.OK,
      message: PostNotifyMessage.UPDATE_POST_SUCCESSFUL,
      data: post,
    };
  }

  @Delete('remove/:postId')
  @ApiOperation({ summary: 'Xoá (ẩn) bài viết' })
  @ApiBody({ type: DeletePostRequestDto })
  @SwaggerApiResponse({
    status: 200,
    description: PostNotifyMessage.DELETE_POST_SUCCESSFUL,
  })
  async removePost(
    @Body() { postId }: DeletePostRequestDto,
  ): Promise<ApiResponse<PostResponse>> {
    const post = await this.postService.removePost(postId);
    this.logger.debug(`Post: ${JSON.stringify(post)}`);

    return {
      statusCode: HttpStatus.OK,
      message: PostNotifyMessage.DELETE_POST_SUCCESSFUL,
      data: post,
    };
  }

  @Post('request-edit')
  @HasRole(RoleName.ADMIN)
  @ApiOperation({ summary: 'Gửi yêu cầu chỉnh sửa bài viết' })
  @ApiBody({
    description: 'Thông tin lý do và nội dung chỉnh sửa gợi ý',
    type: SendRequestChangingPostDto,
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Gửi yêu cầu chỉnh sửa bài viết thành công',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy bài viết',
  })
  @SwaggerApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Lỗi hệ thống khi gửi yêu cầu',
  })
  async sendRequestChangingPost(
    @Body() { postId, reason, contentSuggested }: SendRequestChangingPostDto,
  ): Promise<ApiResponse<void>> {
    await this.postService.sendRequestChangingPost(
      postId,
      reason,
      contentSuggested,
    );

    return {
      statusCode: HttpStatus.OK,
      message: PostNotifyMessage.REQUEST_CHANGE_POST_SUCCESSFUL,
    };
  }

  @Post('report')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Report a post',
    description:
      'Report a specific post by its ID with a description of the issue.',
  })
  @ApiBody({ type: ReportPostDto })
  @SwaggerApiResponse({
    status: 200,
    description: 'Report submitted successfully',
    schema: {
      example: {
        statusCode: 200,
        message: 'Report submitted successfully',
      },
    },
  })
  @SwaggerApiResponse({ status: 404, description: 'Post not found' })
  @SwaggerApiResponse({
    status: 400,
    description: 'You have already reported this post',
  })
  async postReport(
    @GetUser() user: JwtPayload,
    @Body() { postId, description }: ReportPostDto,
  ): Promise<ApiResponse<string>> {
    const reportPost = await this.postService.reportPost(
      postId,
      description,
      user.sub,
    );
    this.logger.debug(`Report Post: ${reportPost}`);

    return {
      statusCode: HttpStatus.OK,
      message: reportPost,
    };
  }

  @Get('post-report')
  @ApiOperation({
    summary: 'Lấy danh sách các báo cáo bài viết',
    description:
      'API này trả về danh sách các báo cáo bài viết với phân trang, chỉ dành cho người dùng đã xác thực.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Số trang của danh sách báo cáo bài viết',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Số lượng báo cáo bài viết tối đa trên mỗi trang',
    type: Number,
    example: 10,
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách báo cáo bài viết thành công',
    type: PostReportResponseDto,
    isArray: true,
    schema: {
      example: {
        statusCode: 200,
        message: PostNotifyMessage.GET_POST_REPORT_SUCCESSFUL,
        data: [
          {
            id: 1,
            postTitle: 'Bài viết mẫu',
            userName: 'user123',
            status: 'PENDING',
            description: 'Phát hiện nội dung không phù hợp',
            createdAt: '2025-06-10T09:57:00.000Z',
          },
        ],
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Không có quyền truy cập (JWT không hợp lệ hoặc thiếu)',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description:
      'Không tìm thấy bài viết hoặc người dùng liên quan đến báo cáo',
  })
  @SwaggerApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Có lỗi xảy ra trên máy chủ',
  })
  async getAllPostsReported(
    @Query() { limit, page }: GetAllPostReportsRequestDto,
    @GetUser() user: JwtPayload,
  ): Promise<ApiResponse<PostReportResponseDto[]>> {
    const postReports: PostReportResponseDto[] =
      await this.postService.getAllPostsReported(limit, page, user.sub);
    this.logger.debug(`Post Reports: ${JSON.stringify(postReports)}`);

    return {
      statusCode: HttpStatus.OK,
      message: PostNotifyMessage.GET_POST_REPORT_SUCCESSFUL,
      data: postReports,
    };
  }
}
