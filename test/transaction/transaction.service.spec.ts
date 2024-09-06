import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from '../../src/transaction/transaction.service';
import { Transaction } from '../../src/transaction/entities/transaction.entity';
import { User } from '../../src/user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { MailService } from '../../src/mail/mail.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreditAmountDto } from '../../src/transaction/dto/credit-amount.dto';
import { WithdrawAmountDto } from '../../src/transaction/dto/withdraw-amount.dto';

describe('TransactionService', () => {
  let service: TransactionService;
  let transactionRepository: Repository<Transaction>;
  let userRepository: Repository<User>;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: MailService,
          useValue: {
            sendTransactionConfirmation: jest.fn(),
            sendTransactionLogs: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    transactionRepository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    mailService = module.get<MailService>(MailService);
  });

  describe('creditAmount', () => {
    it('should credit the amount successfully', async () => {
      const creditAmountDto: CreditAmountDto = {
        accountNumber: '12345',
        name: 'John Doe',
        pin: '1234',
        amount: 1000,
      };

      const user = {
        accountNumber: '12345',
        name: 'John Doe',
        pin: 'hashed_pin',
        balance: 1000,
        email: 'test@example.com',
      } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(transactionRepository, 'save').mockResolvedValue({} as Transaction);
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);

      const result = await service.creditAmount(creditAmountDto);

      expect(result).toBeDefined();
      expect(user.balance).toBe(2000); // 1000 + 1000
      expect(mailService.sendTransactionConfirmation).toHaveBeenCalledWith(
        user.email,
        'Credit',
        creditAmountDto.amount,
        user.balance,
      );
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const creditAmountDto: CreditAmountDto = {
        accountNumber: '12345',
        name: 'John Doe',
        pin: '1234',
        amount: 1000,
      };

      await expect(service.creditAmount(creditAmountDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if PIN is invalid', async () => {
      const user = {
        accountNumber: '12345',
        name: 'John Doe',
        pin: 'hashed_pin',
        balance: 1000,
        email: 'test@example.com',
      } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const creditAmountDto: CreditAmountDto = {
        accountNumber: '12345',
        name: 'John Doe',
        pin: '1234',
        amount: 1000,
      };

      await expect(service.creditAmount(creditAmountDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('withdrawAmount', () => {
    it('should withdraw amount successfully', async () => {
      const withdrawAmountDto: WithdrawAmountDto = {
        accountNumber: '12345',
        name: 'John Doe',
        pin: '1234',
        amount: 500,
      };

      const user = {
        accountNumber: '12345',
        name: 'John Doe',
        pin: 'hashed_pin',
        balance: 1000,
        email: 'test@example.com',
        accountType: 'Savings',
      } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(transactionRepository, 'save').mockResolvedValue({} as Transaction);
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);

      const result = await service.withDrawAmount(withdrawAmountDto);

      expect(result).toBeDefined();
      expect(user.balance).toBe(500); // 1000 - 500
      expect(mailService.sendTransactionConfirmation).toHaveBeenCalledWith(
        user.email,
        'Withdraw',
        withdrawAmountDto.amount,
        user.balance,
      );
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const withdrawAmountDto: WithdrawAmountDto = {
        accountNumber: '12345',
        name: 'John Doe',
        pin: '1234',
        amount: 500,
      };

      await expect(service.withDrawAmount(withdrawAmountDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if PIN is invalid', async () => {
      const user = {
        accountNumber: '12345',
        name: 'John Doe',
        pin: 'hashed_pin',
        balance: 1000,
        email: 'test@example.com',
      } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const withdrawAmountDto: WithdrawAmountDto = {
        accountNumber: '12345',
        name: 'John Doe',
        pin: '1234',
        amount: 500,
      };

      await expect(service.withDrawAmount(withdrawAmountDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if balance is insufficient', async () => {
      const user = {
        accountNumber: '12345',
        name: 'John Doe',
        pin: 'hashed_pin',
        balance: 200,
        email: 'test@example.com',
        accountType: 'Savings',
      } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const withdrawAmountDto: WithdrawAmountDto = {
        accountNumber: '12345',
        name: 'John Doe',
        pin: '1234',
        amount: 500,
      };

      await expect(service.withDrawAmount(withdrawAmountDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getCurrentBalance', () => {
    it('should return the balance successfully', async () => {
      const user = {
        accountNumber: '12345',
        name: 'John Doe',
        balance: 1000,
      } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await service.getCurrentBalance('12345');

      expect(result).toEqual({
        name: user.name,
        accountNumber: user.accountNumber,
        balance: user.balance,
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getCurrentBalance('12345')).rejects.toThrow(NotFoundException);
    });
  });
});
