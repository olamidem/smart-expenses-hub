import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  SettlementsService,
  Balance,
  SuggestedPayment,
} from './settlements.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { userId: string; email: string };
}

@Controller('groups/:groupId')
@UseGuards(JwtAuthGuard)
export class SettlementsController {
  constructor(private settlementsService: SettlementsService) {}

  @Get('balances')
  getBalances(
    @Param('groupId') groupId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<Balance[]> {
    return this.settlementsService.calculateBalances(groupId, req.user.userId);
  }

  @Get('settlements/suggested')
  getSuggested(
    @Param('groupId') groupId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<SuggestedPayment[]> {
    return this.settlementsService.suggestSettlements(groupId, req.user.userId);
  }

  @Post('settlements')
  record(
    @Param('groupId') groupId: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateSettlementDto,
  ) {
    return this.settlementsService.recordSettlement(
      groupId,
      req.user.userId,
      dto,
    );
  }
}
