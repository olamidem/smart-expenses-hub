import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroupsService } from '../groups/groups.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';

export interface Balance {
  groupMemberId: string;
  balanceCents: number; // positive = is owed money, negative = owes money
}

export interface SuggestedPayment {
  fromMemberId: string;
  toMemberId: string;
  amountCents: number;
}

@Injectable()
export class SettlementsService {
  constructor(
    private prisma: PrismaService,
    private groupsService: GroupsService,
  ) {}

  async calculateBalances(
    groupId: string,
    requestingUserId: string,
  ): Promise<Balance[]> {
    await this.groupsService.findOne(groupId, requestingUserId); // membership check

    const members = await this.prisma.groupMember.findMany({
      where: { groupId },
    });
    const balances = new Map<string, number>();
    for (const m of members) balances.set(m.id, 0);

    const expenses = await this.prisma.expense.findMany({
      where: { groupId },
      include: { shares: true },
    });

    for (const expense of expenses) {
      // Whoever paid fronted the money — credit them the full amount.
      balances.set(
        expense.paidById,
        (balances.get(expense.paidById) ?? 0) + expense.amountCents,
      );
      // Each share is what that member actually owes for this expense.
      for (const share of expense.shares) {
        balances.set(
          share.groupMemberId,
          (balances.get(share.groupMemberId) ?? 0) - share.amountCents,
        );
      }
    }

    const settlements = await this.prisma.settlement.findMany({
      where: { groupId },
    });
    for (const s of settlements) {
      // Paying money moves your balance toward zero (less owed).
      balances.set(
        s.fromMemberId,
        (balances.get(s.fromMemberId) ?? 0) + s.amountCents,
      );
      // Receiving money moves your balance toward zero (less owed to you).
      balances.set(
        s.toMemberId,
        (balances.get(s.toMemberId) ?? 0) - s.amountCents,
      );
    }

    return Array.from(balances.entries()).map(
      ([groupMemberId, balanceCents]) => ({
        groupMemberId,
        balanceCents,
      }),
    );
  }

  async suggestSettlements(
    groupId: string,
    requestingUserId: string,
  ): Promise<SuggestedPayment[]> {
    const balances = await this.calculateBalances(groupId, requestingUserId);

    // Split into creditors (owed money) and debtors (owe money), ignore anyone already at zero.
    const creditors = balances
      .filter((b) => b.balanceCents > 0)
      .map((b) => ({ ...b }))
      .sort((a, b) => b.balanceCents - a.balanceCents);

    const debtors = balances
      .filter((b) => b.balanceCents < 0)
      .map((b) => ({
        groupMemberId: b.groupMemberId,
        balanceCents: -b.balanceCents,
      }))
      .sort((a, b) => b.balanceCents - a.balanceCents);

    const payments: SuggestedPayment[] = [];
    let i = 0; // pointer into debtors
    let j = 0; // pointer into creditors

    // Greedy match: pair the biggest debtor against the biggest creditor,
    // settle as much as possible, and move on once either side hits zero.
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(debtor.balanceCents, creditor.balanceCents);

      if (amount > 0) {
        payments.push({
          fromMemberId: debtor.groupMemberId,
          toMemberId: creditor.groupMemberId,
          amountCents: amount,
        });
      }

      debtor.balanceCents -= amount;
      creditor.balanceCents -= amount;

      if (debtor.balanceCents === 0) i++;
      if (creditor.balanceCents === 0) j++;
    }

    return payments;
  }

  async recordSettlement(
    groupId: string,
    requestingUserId: string,
    dto: CreateSettlementDto,
  ) {
    const group = await this.groupsService.findOne(groupId, requestingUserId);
    const memberIds = new Set(group.members.map((m) => m.id));

    if (!memberIds.has(dto.fromMemberId) || !memberIds.has(dto.toMemberId)) {
      throw new BadRequestException('Both members must belong to this group');
    }
    if (dto.fromMemberId === dto.toMemberId) {
      throw new BadRequestException(
        'fromMemberId and toMemberId must be different',
      );
    }

    return this.prisma.settlement.create({
      data: {
        groupId,
        fromMemberId: dto.fromMemberId,
        toMemberId: dto.toMemberId,
        amountCents: dto.amountCents,
      },
    });
  }
}
