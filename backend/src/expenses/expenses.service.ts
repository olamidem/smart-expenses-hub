import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroupsService } from '../groups/groups.service';
import { CreateExpenseDto, SplitType } from './dto/create-expenses.dto';

@Injectable()
export class ExpensesService {
  constructor(
    private prisma: PrismaService,
    private groupsService: GroupsService,
  ) {}

  async create(
    groupId: string,
    requestingUserId: string,
    dto: CreateExpenseDto,
  ) {
    const group = await this.groupsService.findOne(groupId, requestingUserId); // membership check
    const memberIds = new Set(group.members.map((m) => m.id));

    if (!memberIds.has(dto.paidByMemberId)) {
      throw new BadRequestException(
        'paidByMemberId is not a member of this group',
      );
    }

    const shares =
      dto.splitType === SplitType.EQUAL
        ? this.buildEqualShares(dto, memberIds)
        : this.buildExactShares(dto, memberIds);

    return this.prisma.expense.create({
      data: {
        groupId,
        paidById: dto.paidByMemberId,
        description: dto.description,
        amountCents: dto.amountCents,
        splitType: dto.splitType,
        shares: {
          create: shares.map((s) => ({
            groupMemberId: s.groupMemberId,
            amountCents: s.amountCents,
          })),
        },
      },
      include: { shares: true },
    });
  }

  private buildEqualShares(dto: CreateExpenseDto, validMemberIds: Set<string>) {
    const participants = dto.participantMemberIds ?? Array.from(validMemberIds);

    for (const id of participants) {
      if (!validMemberIds.has(id)) {
        throw new BadRequestException(`${id} is not a member of this group`);
      }
    }
    if (participants.length === 0) {
      throw new BadRequestException('At least one participant is required');
    }

    // Deterministic remainder distribution: sort so the same input always
    // produces the same result (important for tests and for trust — if a
    // user re-reads this later, the "extra cent" always lands the same way).
    const sorted = [...participants].sort();
    const base = Math.floor(dto.amountCents / sorted.length);
    const remainder = dto.amountCents % sorted.length;

    return sorted.map((groupMemberId, index) => ({
      groupMemberId,
      // First `remainder` participants (in sorted order) absorb the leftover cents.
      amountCents: base + (index < remainder ? 1 : 0),
    }));
  }

  private buildExactShares(dto: CreateExpenseDto, validMemberIds: Set<string>) {
    const shares = dto.shares ?? [];
    if (shares.length === 0) {
      throw new BadRequestException('shares are required for EXACT split');
    }

    for (const s of shares) {
      if (!validMemberIds.has(s.groupMemberId)) {
        throw new BadRequestException(
          `${s.groupMemberId} is not a member of this group`,
        );
      }
    }

    const sum = shares.reduce((total, s) => total + s.amountCents, 0);
    if (sum !== dto.amountCents) {
      throw new BadRequestException(
        `Shares sum to ${sum} cents but expense total is ${dto.amountCents} cents`,
      );
    }

    return shares;
  }

  async findAllForGroup(groupId: string, requestingUserId: string) {
    await this.groupsService.findOne(groupId, requestingUserId); // membership check
    return this.prisma.expense.findMany({
      where: { groupId },
      include: { shares: true },
      orderBy: { spentAt: 'desc' },
    });
  }
}
