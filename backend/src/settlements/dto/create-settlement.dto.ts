import { IsInt, IsPositive, IsUUID } from 'class-validator';

export class CreateSettlementDto {
  @IsUUID()
  fromMemberId!: string;

  @IsUUID()
  toMemberId!: string;

  @IsInt()
  @IsPositive()
  amountCents!: number;
}
