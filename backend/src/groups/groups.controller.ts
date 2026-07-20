import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { userId: string; email: string };
}

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  @Post()
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateGroupDto) {
    return this.groupsService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.groupsService.findAllForUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.groupsService.findOne(id, req.user.userId);
  }

  @Post(':id/members')
  addMember(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: AddMemberDto,
  ) {
    return this.groupsService.addMember(id, req.user.userId, dto);
  }
}
