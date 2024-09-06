import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from '../../src/transaction/transaction.controller';
import { TransactionService } from '../../src/transaction/transaction.service';
import { CreditAmountDto } from '../../src/transaction/dto/credit-amount.dto';
import { WithdrawAmountDto } from '../../src/transaction/dto/withdraw-amount.dto';
import { Transaction } from '../../src/transaction/entities/transaction.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { User } from '../../src/user/entities/user.entity'

describe('TransactionController', () => {
  let controller: TransactionController;
  let service: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: {
            creditAmount: jest.fn(),
            withDrawAmount: jest.fn(),
            getCurrentBalance: jest.fn(),
            getTransactionLogs: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    service = module.get<TransactionService>(TransactionService);
  });

  describe('creditAmount', () => {
    const creditAmountDto: CreditAmountDto = {
      accountNumber: '1234567890',
      name: 'John Doe',
      pin: '1234',
      amount: 100,
    };

    it('should credit the amount successfully', async () => {
      const transaction: Transaction = {
        id: '1', ...creditAmountDto, type: 'Credit', timestamp: new Date(),
        user: new User,
        balanceAfterTransaction: 0,
        description: 'Credit of amount 100'
      };
      (service.creditAmount as jest.Mock).mockResolvedValue(transaction);

      const result = await controller.creditAmount(creditAmountDto, { user: { id: '1' } } as any);

      expect(result).toEqual(transaction);
      expect(service.creditAmount).toHaveBeenCalledWith(creditAmountDto);
    });

    it('should throw HttpException on credit amount failure', async () => {
      (service.creditAmount as jest.Mock).mockRejectedValue(new Error('Failed to credit amount'));

      await expect(controller.creditAmount(creditAmountDto, { user: { id: '1' } } as any)).rejects.toThrow(
        new HttpException('Failed to credit amount', HttpStatus.BAD_REQUEST),
      );
      expect(service.creditAmount).toHaveBeenCalledWith(creditAmountDto);
    });
  });

  describe('withdrawAmount', () => {
    const withdrawAmountDto: WithdrawAmountDto = {
      accountNumber: '1234567890',
      name: 'John Doe',
      pin: '1234',
      amount: 100,
    };

    it('should withdraw the amount successfully', async () => {
      const transaction: Transaction = {
        id: '1', ...withdrawAmountDto, type: 'Withdraw', timestamp: new Date(),
        user: new User,
        balanceAfterTransaction: 0,
        description: 'Withdraw of amount 100'
      };
      (service.withDrawAmount as jest.Mock).mockResolvedValue(transaction);

      const result = await controller.withdrawAmount(withdrawAmountDto, { user: { id: '1' } } as any);

      expect(result).toEqual(transaction);
      expect(service.withDrawAmount).toHaveBeenCalledWith(withdrawAmountDto);
    });

    it('should throw HttpException on withdraw amount failure', async () => {
      (service.withDrawAmount as jest.Mock).mockRejectedValue(new Error('Failed to withdraw amount'));

      await expect(controller.withdrawAmount(withdrawAmountDto, { user: { id: '1' } } as any)).rejects.toThrow(
        new HttpException('Failed to withdraw amount', HttpStatus.BAD_REQUEST),
      );
      expect(service.withDrawAmount).toHaveBeenCalledWith(withdrawAmountDto);
    });
  });

  describe('checkCurrentBalance', () => {
    const accountNumber = '1234567890';

    it('should return current balance successfully', async () => {
      const balance = 5000;
      (service.getCurrentBalance as jest.Mock).mockResolvedValue(balance);

      const result = await controller.checkCurrentBalance(accountNumber, { user: { id: '1' } } as any);

      expect(result).toEqual(balance);
      expect(service.getCurrentBalance).toHaveBeenCalledWith(accountNumber);
    });

    it('should throw HttpException on balance check failure', async () => {
      (service.getCurrentBalance as jest.Mock).mockRejectedValue(new Error('Failed to retrieve balance'));

      await expect(controller.checkCurrentBalance(accountNumber, { user: { id: '1' } } as any)).rejects.toThrow(
        new HttpException('Failed to retrieve balance', HttpStatus.BAD_GATEWAY),
      );
      expect(service.getCurrentBalance).toHaveBeenCalledWith(accountNumber);
    });
  });

  describe('getTransactionLogs', () => {
    const userId = '1';

    it('should return transaction logs successfully', async () => {
      const logs = [{ id: '1', amount: 100, type: 'credit', timestamp: new Date() }];
      (service.getTransactionLogs as jest.Mock).mockResolvedValue(logs);

      const result = await controller.getTransactionLogs(userId, { user: { id: '1' } } as any);

      expect(result).toEqual(logs);
      expect(service.getTransactionLogs).toHaveBeenCalledWith(userId, undefined);
    });

    it('should throw HttpException on logs retrieval failure', async () => {
      (service.getTransactionLogs as jest.Mock).mockRejectedValue(new Error('Failed to retrieve logs'));

      await expect(controller.getTransactionLogs(userId, { user: { id: '1' } } as any)).rejects.toThrow(
        new HttpException('Failed to retrieve logs', HttpStatus.BAD_REQUEST),
      );
      expect(service.getTransactionLogs).toHaveBeenCalledWith(userId, undefined);
    });
  });
});
