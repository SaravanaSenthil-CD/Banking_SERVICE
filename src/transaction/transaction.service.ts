import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../transaction/entities/transaction.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { CreditAmountDto } from './dto/credit-amount.dto';
import * as bcrypt from 'bcrypt';
import { WithdrawAmountDto } from './dto/withdraw-amount.dto';
import { Workbook } from 'exceljs';
import { Response } from 'express';
import { timeStamp } from 'console';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepositry: Repository<Transaction>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async creditAmount(creditAmountDto: CreditAmountDto): Promise<Transaction> {
    const user = await this.userRepository.findOne({
      where: { accountNumber: creditAmountDto.accountNumber },
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    const isPinValid = await bcrypt.compare(creditAmountDto.pin, user.pin);

    if (!isPinValid) {
      throw new BadRequestException('Invalid PIN');
    }

    const transaction = new Transaction();
    transaction.user = user;
    transaction.type = 'Credit';
    transaction.amount = creditAmountDto.amount;
    transaction.balanceAfterTransaction = user.balance + creditAmountDto.amount;
    transaction.description = `Credit of amount ${creditAmountDto.amount}`;
    transaction.timestamp = new Date();

    user.balance += creditAmountDto.amount;
    await this.userRepository.save(user);

    return await this.transactionRepositry.save(transaction);
  }

  async withDrawAmount(
    withdrawAmountDto: WithdrawAmountDto,
  ): Promise<Transaction> {
    // const { accountNumber, name, pin, amount } = withdrawAmountDto;

    const user = await this.userRepository.findOne({
      where: { accountNumber: withdrawAmountDto.accountNumber },
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }
    const isPinValid = await bcrypt.compare(withdrawAmountDto.pin, user.pin);

    if (!isPinValid) {
      throw new BadRequestException('Invalid PIN');
    }

    if (user.balance < withdrawAmountDto.amount) {
      throw new BadRequestException('Insufficient Balance');
    }

    const minimumBalance = user.accountType == 'Savings' ? 500 : 0;

    if (user.balance - withdrawAmountDto.amount < minimumBalance) {
      throw new BadRequestException('cannot withdraw beyond minimum balance');
    }

    user.balance -= withdrawAmountDto.amount;

    const transaction = new Transaction();
    transaction.user = user;
    transaction.type = 'Withdraw';
    transaction.amount = withdrawAmountDto.amount;
    transaction.balanceAfterTransaction = user.balance;
    transaction.description = `Withdraw of amount ${withdrawAmountDto.amount}`;
    transaction.timestamp = new Date();

    await this.userRepository.save(user);
    return this.transactionRepositry.save(transaction);
  }

  async getCurrentBalance(
    accountNumber: string,
  ): Promise<{ balance: number; accountNumber: string; name: string }> {
    const user = await this.userRepository.findOne({
      where: { accountNumber },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      name: user.name,
      accountNumber: user.accountNumber,
      balance: user.balance,
    };
  }

  async getTransactionLogs(userId: string, response: Response): Promise<void> {
    const transactions = await this.transactionRepositry.find({
      where: { id: userId },
    });

    if (!transactions.length) {
      throw new NotFoundException('No transaction Logs found');
    }

    const workbook = new Workbook();
    const workSheet = workbook.addWorksheet('Transaction');

    workSheet.columns = [
      { header: 'ID', key: 'id', width: 36 },
      { header: 'Type', key: 'type', width: 10 },
      { header: 'Amount', key: 'amount', width: 15 },
      {
        header: 'Balance After Transtion',
        key: 'balanceaftertranscation',
        width: 30,
      },
      { header: 'Timestamp', key: 'timestamp', width: 30 },
      { header: 'Description', key: 'description', width: 30 },
    ];

    transactions.forEach((transaction) => {
      const row = workSheet.addRow({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        balanceaftertrancation: transaction.balanceAfterTransaction,
        timeStamp: transaction.timestamp,
        description: transaction.description,
      });
    });

    response.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    response.setHeader(
      'Content-Disposition',
      'attachment; filename="transaction_logs.xlsx"',
    );

    await workbook.xlsx.write(response);
    response.end();
  }
}
