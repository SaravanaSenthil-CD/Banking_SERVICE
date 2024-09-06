import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreditAmountDto } from './dto/credit-amount.dto';
import { WithdrawAmountDto } from './dto/withdraw-amount.dto';
import { Transaction } from './entities/transaction.entity';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/auth.gaurd';

@Controller('transaction')
export class TransactionController {
  private readonly logger = new Logger(TransactionController.name);

  constructor(private readonly transactionService: TransactionService) {}

  @UseGuards(JwtAuthGuard)
  @Post('credit')
  async creditAmount(
    @Body() creditAmountDto: CreditAmountDto,
    @Req() req: Request,
  ): Promise<Transaction> {
    try {
      const result = await this.transactionService.creditAmount(creditAmountDto);
      this.logger.log(`Amount credited successfully for user: ${creditAmountDto.name}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to credit amount for user: ${creditAmountDto.name}. Error: ${error.message}`,
        error.stack,
      );
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('withdraw')
  async withdrawAmount(
    @Body() withdrawAmountDto: WithdrawAmountDto,
    @Req() req: Request,
  ): Promise<Transaction> {
    try {
      const result = await this.transactionService.withDrawAmount(withdrawAmountDto);
      this.logger.log(`Amount withdrawn successfully for user: ${withdrawAmountDto.name}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to withdraw amount for user: ${withdrawAmountDto.name}. Error: ${error.message}`,
        error.stack,
      );
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('balance/:accountNumber')
  async checkCurrentBalance(
    @Param('accountNumber') accountNumber: string,
    @Req() req: Request,
  ) {
    try {
      const balance = await this.transactionService.getCurrentBalance(accountNumber);
      this.logger.log(`Balance retrieved successfully for account: ${accountNumber}`);
      return balance;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve balance for account: ${accountNumber}. Error: ${error.message}`,
        error.stack,
      );
      throw new HttpException(error.message, HttpStatus.BAD_GATEWAY);
    }
  }

  // @UseGuards(JwtAuthGuard)
  @Get('logs/:userId')
  async getTransactionLogs(
    @Param('userId') userId: string,
    @Req() req: Request,
  ) {
    try {
      const logs = await this.transactionService.getTransactionLogs(userId, req.res);
      this.logger.log(`Transaction logs retrieved successfully for user: ${userId}`);
      return logs;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve transaction logs for user: ${userId}. Error: ${error.message}`,
        error.stack,
      );
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
