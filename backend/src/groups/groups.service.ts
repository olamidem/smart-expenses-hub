import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class GroupsService {
    constructor(private prisma: PrismaService) { }
  async create(creatorUserId: string, dto: CreateGroupDto) {
    return this.prisma.group.create({
      data: {
        name: dto.name,
        currency: dto.currency ?? 'EUR',
        members: {
          create: {
            userId: creatorUserId,
            role: 'ADMIN',
          },
        },
      },
      include: { members: true },
    });
  }

  async findAllForUser(userId: string) {
    return await this.prisma.group.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: { members: true },
    });
  }

  async findOne(groupId: string, requestingUserId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { members: { include: { user: true } } },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const isMember = group.members.some((m) => m.userId === requestingUserId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this group');
    }
    return group;
  }

  async addMember(
    groupId: string,
    requestingUserId: string,
    dto: AddMemberDto,
  ) {
    await this.findOne(groupId, requestingUserId); // reuses membership check above

    if (dto.userId && dto.displayName) {
      throw new BadRequestException(
        'Provide either userId or displayName, not both',
      );
    }
    if (!dto.userId && !dto.displayName) {
      throw new BadRequestException('Provide either userId or displayName');
    }

    return this.prisma.groupMember.create({
      data: {
        groupId,
        userId: dto.userId,
        displayName: dto.displayName,
      },
      include: { user: true },
    });
  }
}
