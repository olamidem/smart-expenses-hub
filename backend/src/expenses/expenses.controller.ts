import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateExpenseDto } from './dto/create-expenses.dto';

interface AuthenticatedRequest {
  user: { userId: string; email: string };
}

@Controller('groups/:groupId/expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  @Post()
  create(
    @Param('groupId') groupId: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expensesService.create(groupId, req.user.userId, dto);
  }

  @Get()
  findAll(
    @Param('groupId') groupId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.expensesService.findAllForGroup(groupId, req.user.userId);
  }
}
