import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SplitType {
  EQUAL = 'EQUAL',
  EXACT = 'EXACT',
}

export class ExactShareDto {
  @IsUUID()
  groupMemberId!: string;

  @IsInt()
  @IsPositive()
  amountCents!: number;
}

export class CreateExpenseDto {
  @IsString()
  @MinLength(1)
  description!: string;

  @IsInt()
  @IsPositive()
  amountCents!: number;

  @IsUUID()
  paidByMemberId!: string;

  @IsEnum(SplitType)
  splitType!: SplitType;

  // Only relevant for EQUAL — who shares the cost. Defaults to everyone in the group if omitted.
  @ValidateIf((o: CreateExpenseDto) => o.splitType === SplitType.EQUAL)
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  participantMemberIds?: string[];

  // Required for EXACT — must sum to amountCents, validated in the service.
  @ValidateIf((o: CreateExpenseDto) => o.splitType === SplitType.EXACT)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExactShareDto)
  shares?: ExactShareDto[];
}
