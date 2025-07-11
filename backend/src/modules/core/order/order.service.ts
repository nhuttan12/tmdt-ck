import { GetAllOrdersResponseDto } from '@dtos/order/get-all-order-response.dto';
import { GetOrderDetailsByOrderIdResponseDto } from '@dtos/order/get-order-details-by-order-id-response.dto';
import { ImageType } from '@enum/image-type.enum';
import { PaymentMethod } from '@enum/payment-method.enum';
import { ShippingMethod } from '@enum/shipping_method.enum';
import { CartDetailStatus } from '@enum/status/cart-detail-status.enum';
import { CartStatus } from '@enum/status/cart-status.enum';
import { ImageStatus } from '@enum/status/image-status.enum';
import { OrderStatus } from '@enum/status/order-status.enum';
import { DrizzleAsyncProvider } from '@helper-modules/database/drizzle.provider';
import { SearchService } from '@helper-modules/services/search.service';
import { UtilityService } from '@helper-modules/services/utility.service';
import { ErrorMessage } from '@message/error-message';
import { MessageLog } from '@message/message-log';
import { Property } from '@message/property';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  cartDetails,
  carts,
  images,
  orderDetails,
  orders,
  productImages,
  products,
} from '@schema';
import { Order, OrderInsert } from '@schema-type';
import { and, eq, inArray } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: MySql2Database<any>,
    private searchService: SearchService,
    private utilityService: UtilityService,
  ) {}
  async getAllOrders(
    userId: number,
    limit: number,
    offset: number,
  ): Promise<GetAllOrdersResponseDto[]> {
    const { skip, take } = this.utilityService.getPagination(offset, limit);

    const orderList = await this.db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .limit(take)
      .offset(skip);
    this.logger.debug(`Order list ${JSON.stringify(orderList)}`);

    const result: GetAllOrdersResponseDto[] = orderList.map((o) => ({
      id: o.id,
      userId: o.userId,
      totalPrice: o.totalPrice,
      paymentMethod: o.paymentMethod,
      shippingMethod: o.shippingMethod,
      status: o.status,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
    }));
    this.logger.debug(`Order list ${JSON.stringify(result)}`);

    return result;
  }

  async getOrderDetailByOrderId(
    orderId: number,
    userId: number,
  ): Promise<GetOrderDetailsByOrderIdResponseDto[]> {
    const orderDetailList = await this.db
      .select()
      .from(orders)
      .innerJoin(orderDetails, eq(orders.id, orderDetails.orderId))
      .where(and(eq(orderDetails.orderId, orderId), eq(orders.userId, userId)));

    const productIds: number[] = orderDetailList.map(
      (od) => od.order_details.productId,
    );

    const iamgeList = await this.db
      .select()
      .from(productImages)
      .innerJoin(images, eq(productImages.imageId, images.id))
      .where(
        and(
          inArray(productImages.productId, productIds),
          eq(images.status, ImageStatus.ACTIVE),
          eq(images.type, ImageType.THUMBNAIL),
        ),
      );

    const productList = await this.db
      .select()
      .from(products)
      .where(inArray(products.id, productIds));

    const result: GetOrderDetailsByOrderIdResponseDto[] = orderDetailList.map(
      (od) => {
        const img = iamgeList.find(
          (img) => img.product_images.productId === od.order_details.productId,
        );

        if (!img) {
          this.logger.error(`${MessageLog.CATEGORY_NOT_FOUND}`);
          throw new NotFoundException(
            `${Property.IMAGE} ${ErrorMessage.NOT_EXIST}`,
          );
        }

        const prod = productList.find(
          (prod) => prod.id === od.order_details.productId,
        );

        if (!prod) {
          this.logger.error(`${MessageLog.PRODUCT} ${MessageLog.NOT_FOUND}`);
          throw new NotFoundException(
            `${Property.PRODUCT} ${ErrorMessage.NOT_EXIST}`,
          );
        }

        return {
          id: od.order_details.id,
          orderId: od.order_details.orderId,
          productname: prod.name,
          imageUrl: img.images.url,
          quantity: od.order_details.quantity,
          price: od.order_details.price,
          totalPrice: od.order_details.totalPrice,
        };
      },
    );

    return result;
  }

  async cancelOrder(orderId: number, userId: number): Promise<Order> {
    // 1. Finding order
    const order: Order = await this.searchService.findOneOrThrow(
      this.db,
      orders,
      eq(orders.id, orderId),
    );

    // %. Update order status to cancel
    const result = await this.db.transaction(async (tx) => {
      return await tx
        .update(orders)
        .set({ status: OrderStatus.Canceled, updated_at: new Date() })
        .where(and(eq(orders.userId, userId), eq(orders.id, orderId)));
    });

    if (!result) {
      this.logger.error(`${MessageLog.ORDER} ${MessageLog.NOT_FOUND}`);
      throw new InternalServerErrorException(
        ErrorMessage.INTERNAL_SERVER_ERROR,
      );
    }

    return order;
  }

  async createOrder(
    userId: number,
    paymentMethod: PaymentMethod,
    shippingMethod: ShippingMethod,
    address: string,
    city: string,
    country: string,
  ): Promise<Order> {
    // get user active cart
    const [cart] = await this.db
      .select()
      .from(carts)
      .where(and(eq(carts.userId, userId), eq(carts.status, CartStatus.ACTIVE)))
      .limit(1);

    if (!cart) {
      throw new InternalServerErrorException('Không tìm thấy giỏ hàng.');
    }

    // get cart detail active in this cart
    const cartDetailsList = await this.db
      .select()
      .from(cartDetails)
      .where(
        and(
          eq(cartDetails.cartId, cart.id),
          eq(cartDetails.status, CartDetailStatus.ACTIVE),
        ),
      );

    if (cartDetailsList.length === 0) {
      throw new InternalServerErrorException('Giỏ hàng rỗng.');
    }

    // create new order
    const orderValue: OrderInsert = {
      userId: userId,
      cartId: cart.id,
      totalPrice: cartDetailsList.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
      paymentMethod,
      shippingMethod,
      address,
      city,
      country,
      status: OrderStatus.Pending,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const [orderCreatedId]: { id: number }[] = await this.db.transaction((tx) =>
      tx.insert(orders).values(orderValue).$returningId(),
    );

    // create order detail for each cart detail
    for (const detail of cartDetailsList) {
      await this.db.insert(orderDetails).values({
        orderId: orderCreatedId.id,
        productId: detail.productId,
        quantity: detail.quantity,
        price: detail.price,
        totalPrice: detail.price * detail.quantity,
      });
    }

    // update cart and status
    await this.db
      .update(carts)
      .set({ status: CartStatus.ORDERED, updated_at: new Date() })
      .where(eq(carts.id, cart.id));

    // return order created
    return await this.searchService.findOneOrThrow(
      this.db,
      orders,
      eq(orders.id, orderCreatedId.id),
    );
  }
}
