import { VoucherStatus } from '@enum/status/vouchers-status.enum';

export class UpdateVoucherRequestDto {
  voucherId: number;
  voucherCode: string;
  status: VoucherStatus;
  discount: number;
  expireAt: Date;
}
