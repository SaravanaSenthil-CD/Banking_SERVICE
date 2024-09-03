import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreditAmountDto } from './dto/credit-amount.dto';
import { Transaction } from '../transaction/entities/transaction.entity';
import { WithdrawAmountDto } from './dto/withdraw-amount.dto';
import { Response } from 'express';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('credit')
  async creditAmount(
    @Body() creditAmountDto: CreditAmountDto,
  ): Promise<Transaction> {
    try {
      return await this.transactionService.creditAmount(creditAmountDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('withdraw')
  async WithdrawAmount(
    @Body() withdrawAmountDto: WithdrawAmountDto,
  ): Promise<Transaction> {
    try {
      return await this.transactionService.withDrawAmount(withdrawAmountDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('balance/:accountNumber')
  async checkCurrentBalance(
    @Param('accountNumber') accountNumber: string,
  ): Promise<{ balance: number; accountNumber: string; name: string }> {
    try {
      return this.transactionService.getCurrentBalance(accountNumber);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_GATEWAY);
    }
  }
  @Get('logs/:userId')
  async getTransactionLogs(
    @Param('userId') userId: string,
    @Res() response: Response,
  ): Promise<void> {
    return this.transactionService.getTransactionLogs(userId, response);
  }
}
