import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiResponse as ApiSwaggerResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { WishlistService } from '@core-modules/product/wishlist/wishlist.service';
import { JwtAuthGuard } from '@guard/jwt-auth.guard';
import { RolesGuard } from '@guard/roles.guard';
import { Role } from '@enum/role.enum';
import { HasRole } from '@decorator/roles.decorator';
import { CatchEverythingFilter } from '@filter/exception.filter';
import { CreateWishlistDto } from '@dtos/wishlist/create-wishlist.dto';
import { WishlistResponseDto } from '@dtos/wishlist/wishlist-response.dto';
import { JwtPayload } from '@interfaces';
import { ApiResponse } from '@dtos/response/ApiResponse/ApiResponse';
import { NotifyMessage } from '@message/notify-message';
import { RemoveWishlistDto } from '@dtos/wishlist/remove-wishlist.dto';
import { GetUser } from '@decorator/user.decorator';
import { GetAllProductResponseDto } from '@dtos/product/get-all-product-response.dto';
import { WishlistNotifyMessage } from '@message/wishlist-message';
import { GetAllWishListProductsRequest } from '@core-modules/product/wishlist/get-all-wishlist-product-request.dto';

@Controller('wishlist')
@ApiTags('Wishlist')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@HasRole(Role.USER, Role.ADMIN)
@UseFilters(CatchEverythingFilter)
export class WishlistController {
  private readonly logger = new Logger(WishlistController.name);

  constructor(private readonly wishlistService: WishlistService) { }

  @Get('products')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm yêu thích' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiSwaggerResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách sản phẩm yêu thích thành công',
    type: GetAllProductResponseDto,
    isArray: true,
  })
  async getWishlistProducts(
    @GetUser() user: JwtPayload,
    @Query() { limit, page }: GetAllWishListProductsRequest,
  ): Promise<ApiResponse<GetAllProductResponseDto[]>> {
    const data = await this.wishlistService.getWishlistProducts(
      user.sub,
      limit,
      page,
    );

    return {
      statusCode: HttpStatus.OK,
      message: WishlistNotifyMessage.GET_WISHLIST_PRODUCTS_SUCCESSFUL,
      data,
    };
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Thêm sản phẩm vào wishlist' })
  @ApiBody({ type: CreateWishlistDto })
  @ApiSwaggerResponse({
    status: HttpStatus.CREATED,
    description: 'Thêm vào wishlist thành công',
    type: WishlistResponseDto,
  })
  @ApiSwaggerResponse({
    status: HttpStatus.CONFLICT,
    description: 'Sản phẩm đã có trong wishlist',
  })
  async createWishlist(
    @GetUser() userId: JwtPayload,
    @Body() { productId }: CreateWishlistDto,
  ): Promise<ApiResponse<WishlistResponseDto>> {
    const wishlists = await this.wishlistService.createWishList(
      userId.sub,
      productId,
    );
    this.logger.debug(`Wishlist: ${JSON.stringify(wishlists)}`);

    return {
      statusCode: HttpStatus.CREATED,
      message: NotifyMessage.CREATE_WISHLIST_SUCCESSFUL,
      data: wishlists,
    };
  }

  @Delete('remove')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Xóa sản phẩm khỏi wishlist (soft delete)' })
  @ApiBody({ type: RemoveWishlistDto })
  @ApiSwaggerResponse({
    status: HttpStatus.OK,
    description: 'Xóa khỏi wishlist thành công',
    type: WishlistResponseDto,
  })
  @ApiSwaggerResponse({
    status: HttpStatus.CONFLICT,
    description: 'Wishlist không tồn tại',
  })
  async removeWishlist(
    @Body() { wishlistId }: RemoveWishlistDto,
    @GetUser() userId: JwtPayload,
  ): Promise<ApiResponse<WishlistResponseDto>> {
    const wishtlist = await this.wishlistService.removeWishList(
      wishlistId,
      userId.sub,
    );
    this.logger.debug(`Remove wishlist: ${JSON.stringify(wishtlist)}`);

    return {
      statusCode: HttpStatus.OK,
      message: NotifyMessage.REMOVE_WISHLIST_SUCCESSFUL,
      data: wishtlist,
    };
  }
}
