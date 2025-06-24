import { CartService } from '@core-modules/cart/cart.service';
import { HasRole } from '@decorator/roles.decorator';
import { GetUser } from '@decorator/user.decorator';
import { CartDetailResponse } from '@dtos/cart-detail/cart-detail-response.dto';
import { GetCartDetailByCartId } from '@dtos/cart-detail/get-cart-detail-by-cart-id';
import { RemoveCartDetailDTO } from '@dtos/cart-detail/remove-cart-detail.dto';
import { CartCreateDTO } from '@dtos/cart/create-cart.dto';
import { FindCartById } from '@dtos/cart/find-cart-by-id.dto';
import { GetAllCartsDTO } from '@dtos/cart/get-all-cart.dto';
import { RemoveCartDTO } from '@dtos/cart/remove-cart.dto';
import { ApiResponse } from '@dtos/response/ApiResponse/ApiResponse';
import { Role } from '@enum/role.enum';
import { CatchEverythingFilter } from '@filter/exception.filter';
import { JwtAuthGuard } from '@guard/jwt-auth.guard';
import { RolesGuard } from '@guard/roles.guard';
import { JwtPayload } from '@interfaces';
import { NotifyMessage } from '@message/notify-message';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Cart, CartDetail } from '@schema-type';

@ApiTags('Cart')
@ApiBearerAuth('jwt')
@UseFilters(CatchEverythingFilter)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('carts')
export class CartController {
  private readonly logger = new Logger();
  constructor(private cartService: CartService) {}

  @Post('adding')
  @HasRole(Role.USER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Thêm giỏ hàng mới' })
  @ApiOkResponse({
    type: ApiResponse,
    description: 'Thêm giỏ hàng thành công',
  })
  async addingnewCart(
    @Body() { productId, quantity }: CartCreateDTO,
    @GetUser() user: JwtPayload,
  ): Promise<ApiResponse<Cart>> {
    const newCart = await this.cartService.addToCart(
      user.sub,
      productId,
      quantity,
    );
    this.logger.debug(`Cart: ${JSON.stringify(newCart)}`);

    return {
      statusCode: HttpStatus.OK,
      message: NotifyMessage.GET_CART_SUCCESSFUL,
      data: newCart,
    };
  }

  @Get()
  @HasRole(Role.USER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy tất cả giỏ hàng (phân trang)' })
  @ApiOkResponse({
    type: ApiResponse,
    description: 'Lấy danh sách giỏ hàng thành công',
  })
  async getAllCart(
    @Query() cart: GetAllCartsDTO,
    @GetUser() user: JwtPayload, // 👈 Lấy user từ token
  ): Promise<ApiResponse<Cart[]>> {
    const carts = await this.cartService.getAllCarts(cart);
    this.logger.debug(`Cart: ${JSON.stringify(carts)}`);

    return {
      statusCode: HttpStatus.OK,
      message: NotifyMessage.GET_CART_SUCCESSFUL,
      data: carts,
    };
  }

@Get('id/:id')
@HasRole(Role.USER)
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Lấy giỏ hàng theo ID' })
@ApiParam({ name: 'id', type: Number, description: 'Order ID' })
@ApiOkResponse({ type: ApiResponse, description: 'Lấy giỏ hàng thành công' })
async getCartById(
  @Param() cart: FindCartById,
  @GetUser() user: JwtPayload,  // Lấy userId từ token
): Promise<ApiResponse<Cart>> {
  const carts = await this.cartService.getCartsById(cart.id, user.sub);
  this.logger.debug(`Cart: ${JSON.stringify(carts)}`);

  return {
    statusCode: HttpStatus.OK,
    message: NotifyMessage.GET_CART_SUCCESSFUL,
    data: carts,
  };
}


@Delete('cart/:id')
@HasRole(Role.USER)
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Xóa giỏ hàng theo ID' })
@ApiParam({ name: 'id', type: Number, description: 'Cart ID' })
@ApiOkResponse({ type: ApiResponse, description: 'Xóa giỏ hàng thành công' })
async removeCart(
  @Param('id') id: number,
  @GetUser() user: JwtPayload,
): Promise<ApiResponse<Cart>> {
  const carts = await this.cartService.removeCart({ cartId: id }, user.sub);

  return {
    statusCode: HttpStatus.OK,
    message: NotifyMessage.GET_CART_SUCCESSFUL,
    data: carts,
  };
}

  @Get('/cart-detail/get')
  @HasRole(Role.USER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy chi tiết giỏ hàng (phân trang)' })
  @ApiQuery({
    name: 'id',
    required: true,
    type: Number,
    description: 'Order ID',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng mỗi trang',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Trang số',
  })
  @ApiOkResponse({
    type: ApiResponse<CartDetailResponse[]>,
    description: 'Lấy chi tiết giỏ hàng thành công',
  })
  async getCartDetailByCartId(
    @Query() { id, limit, page }: GetCartDetailByCartId,
  ): Promise<ApiResponse<CartDetailResponse[]>> {
    const cartDetail = await this.cartService.getCartDetailByCartId(
      id,
      limit,
      page,
    );
    return {
      statusCode: HttpStatus.OK,
      message: NotifyMessage.GET_CART_DETAIL_SUCCESSFUL,
      data: cartDetail,
    };
  }

  @Delete('/cart-detail/remove/:id')
  @HasRole(Role.USER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa chi tiết giỏ hàng theo ID' })
  @ApiParam({ name: 'id', type: Number, description: 'OrderDetail ID' })
  @ApiOkResponse({
    type: ApiResponse<CartDetail>,
    description: 'Xóa chi tiết giỏ hàng thành công',
  })
  async removeCartByCartId(
  @Param('id') id: number
): Promise<ApiResponse<CartDetail>> {
  const cartDetail = await this.cartService.removeCartDetailById(id);
  return {
    statusCode: HttpStatus.OK,
    message: NotifyMessage.REMOVE_CART_DETAIL_SUCCESSFUL,
    data: cartDetail,
  };
}
  // async removeCartByCartId(
  //   @Param() { cartId }: RemoveCartDetailDTO,
  // ): Promise<ApiResponse<CartDetail>> {
  //   const cartDetail = await this.cartService.removeCartDetailById(cartId);
  //   return {
  //     statusCode: HttpStatus.OK,
  //     message: NotifyMessage.REMOVE_CART_DETAIL_SUCCESSFUL,
  //     data: cartDetail,
  //   };
  // }
}
