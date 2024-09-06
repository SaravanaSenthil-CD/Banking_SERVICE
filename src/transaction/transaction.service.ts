import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../transaction/entities/transaction.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { CreditAmountDto } from './dto/credit-amount.dto';
import * as bcrypt from 'bcrypt';
import { WithdrawAmountDto } from './dto/withdraw-amount.dto';
import { Workbook } from 'exceljs';
import { Response } from 'express';
import { MailService } from '../mail/mail.service';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly mailservice:MailService,

  ) {}

  async creditAmount(creditAmountDto: CreditAmountDto): Promise<Transaction> {
    const user = await this.userRepository.findOne({
      where: { accountNumber: creditAmountDto.accountNumber },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPinValid = await bcrypt.compare(creditAmountDto.pin, user.pin);

    if (!isPinValid) {
      throw new BadRequestException('Invalid PIN');
    }

    user.balance = parseFloat(user.balance as any) + creditAmountDto.amount;

    const transaction = new Transaction();
    transaction.user = user;
    transaction.type = 'Credit';
    transaction.amount = creditAmountDto.amount;
    transaction.balanceAfterTransaction = user.balance;
    transaction.description = `Credit of amount ${creditAmountDto.amount}`;
    transaction.timestamp = new Date();

    
    await this.userRepository.save(user);

    const savedTransaction= await this.transactionRepository.save(transaction);
    await this.mailservice.sendTransactionConfirmation(
      user.email,
      'Credit',
      creditAmountDto.amount,
      user.balance,
    );
    return savedTransaction
  }

  async withDrawAmount(
    withdrawAmountDto: WithdrawAmountDto,
  ): Promise<Transaction> {
    const user = await this.userRepository.findOne({
      where: { accountNumber: withdrawAmountDto.accountNumber },
    });

    if (!user) {
      throw new NotFoundException('User not found');
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
      throw new BadRequestException('Cannot withdraw beyond minimum balance');
    }

    user.balance = parseFloat(user.balance as any) - withdrawAmountDto.amount;

    const transaction = new Transaction();
    transaction.user = user;
    transaction.type = 'Withdraw';
    transaction.amount = withdrawAmountDto.amount;
    transaction.balanceAfterTransaction = user.balance;
    transaction.description = `Withdraw of amount ${withdrawAmountDto.amount}`;
    transaction.timestamp = new Date();

    await this.userRepository.save(user);
        const savedTransaction = await this.transactionRepository.save(transaction);
    
        await this.mailservice.sendTransactionConfirmation(
          user.email,
          'Withdraw',
          withdrawAmountDto.amount,
          user.balance,
        );
    
        return savedTransaction;
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
    const transactions = await this.transactionRepository.find({
        where: { id: userId },
    });

    if (!transactions.length) {
        throw new NotFoundException('No transaction logs found');
    }

    const workbook = new Workbook();
    const workSheet = workbook.addWorksheet('Transaction');

    workSheet.columns = [
        { header: 'ID', key: 'id', width: 36 },
        { header: 'Type', key: 'type', width: 10 },
        { header: 'Amount', key: 'amount', width: 15 },
        {
            header: 'Balance After Transaction',
            key: 'balanceAfterTransaction',
            width: 30,
        },
        { header: 'Timestamp', key: 'timestamp', width: 30 },
        { header: 'Description', key: 'description', width: 30 },
    ];

    transactions.forEach((transaction) => {
        workSheet.addRow({
            id: transaction.id,
            type: transaction.type,
            amount: transaction.amount,
            balanceAfterTransaction: transaction.balanceAfterTransaction,
            timestamp: transaction.timestamp,
            description: transaction.description,
        });
    });

    response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.setHeader('Content-Disposition', 'attachment; filename="transaction_logs.xlsx"');

    await workbook.xlsx.write(response);
    response.end();

  
    if (transactions[0]?.user?.email) {
        await this.mailservice.sendTransactionLogs(transactions[0].user.email, transactions.length);
    }
}
}