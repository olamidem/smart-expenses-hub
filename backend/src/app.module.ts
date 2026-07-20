import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GroupsModule } from './groups/groups.module';
import { ExpensesModule } from './expenses/expenses.module';
import { SettlementsModule } from './settlements/settlements.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    GroupsModule,
    ExpensesModule,
    SettlementsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
