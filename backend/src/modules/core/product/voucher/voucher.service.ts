import { VoucherStatus } from '@enum/status/vouchers-status.enum';
import { DrizzleAsyncProvider } from '@helper-modules/database/drizzle.provider';
import { SearchService } from '@helper-modules/services/search.service';
import { UtilityService } from '@helper-modules/services/utility.service';
import { ErrorMessage } from '@message/error-message';
import { MessageLog } from '@message/message-log';
import {
  VoucherErrorMessage,
  VoucherMessageLog,
} from '@message/voucher-error-message';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { vouchers } from '@schema';
import { Voucher } from '@schema-type';
import { voucherMapping } from 'db/schema/voucher-mapping.schema';
import { asc, eq, like } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';

@Injectable()
export class VoucherService {
  private logger = new Logger(VoucherService.name);
  constructor(
    @Inject(DrizzleAsyncProvider) private db: MySql2Database<any>,
    private searchService: SearchService,
    private utilityService: UtilityService,
  ) {}
  async getAllVouchers(limit: number, offset: number): Promise<Voucher[]> {
    const { skip, take } = this.utilityService.getPagination(offset, limit);

    return await this.searchService.findManyOrReturnEmptyArray(
      this.db,
      vouchers,
      undefined,
      take,
      skip,
      asc(vouchers.id),
    );
  }

  async getAllVouchersByUserId(
    userId: number,
    limit: number,
    offset: number,
  ): Promise<Voucher[]> {
    const { skip, take } = this.utilityService.getPagination(offset, limit);

    const voucherList = await this.db
      .select()
      .from(vouchers)
      .innerJoin(voucherMapping, eq(vouchers.id, voucherMapping.voucherId))
      .where(eq(voucherMapping.userId, userId))
      .limit(take)
      .offset(skip);

    const result: Voucher[] = voucherList.map((v) => ({
      id: v.vouchers.id,
      voucherCode: v.vouchers.voucherCode,
      status: v.vouchers.status,
      discount: v.vouchers.discount,
      expireAt: v.vouchers.expireAt,
      created_at: v.vouchers.created_at,
      updated_at: v.vouchers.updated_at,
    }));

    return result;
  }

  async findVoucherByCode(
    voucherCode: string,
    limit: number,
    offset: number,
  ): Promise<Voucher[]> {
    const { skip, take } = this.utilityService.getPagination(offset, limit);

    return await this.searchService.findManyOrReturnEmptyArray(
      this.db,
      vouchers,
      like(vouchers.voucherCode, `%${voucherCode}%`),
      take,
      skip,
      asc(vouchers.id),
    );
  }

  async createVouchers(
    voucherCode: string,
    discount: number,
    expireAt: Date,
    status: VoucherStatus = VoucherStatus.ACTIVE,
  ) {
    const [voucher] = await this.db.transaction(async (tx) => {
      return await tx
        .insert(vouchers)
        .values({
          voucherCode,
          status,
          discount,
          expireAt: expireAt,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .$returningId();
    });

    return await this.getVoucherById(voucher.id);
  }

  async updateVoucherInfo(
    voucherId: number,
    voucherCode: string,
    discount: number,
    expireAt: Date,
    status: VoucherStatus,
  ): Promise<Voucher> {
    const voucher = await this.getVoucherById(voucherId);

    const result = await this.db.transaction(async (tx) => {
      return await tx
        .update(vouchers)
        .set({
          voucherCode,
          status,
          discount,
          expireAt,
          updated_at: new Date(),
        })
        .where(eq(vouchers.id, voucherId));
    });

    if (!result) {
      this.logger.error(VoucherMessageLog.VOUCHER_CANNOT_BE_UPDATED);
      throw new InternalServerErrorException(
        ErrorMessage.INTERNAL_SERVER_ERROR,
      );
    }

    return voucher;
  }

  async deleteVouchers(voucherId: number): Promise<Voucher> {
    const voucher = await this.getVoucherById(voucherId);
    const result = await this.db.transaction(async (tx) => {
      return await tx.delete(vouchers).where(eq(vouchers.id, voucherId));
    });

    if (!result) {
      this.logger.error(MessageLog.VOUCHER_CANNOT_BE_DELETED);
      throw new InternalServerErrorException(
        ErrorMessage.INTERNAL_SERVER_ERROR,
      );
    }

    return voucher;
  }

  async getVoucherById(voucherId: number): Promise<Voucher> {
    return await this.searchService.findOneOrThrow(
      this.db,
      vouchers,
      eq(vouchers.id, voucherId),
      VoucherErrorMessage.VOUCHER_NOT_FOUND,
    );
  }
}
