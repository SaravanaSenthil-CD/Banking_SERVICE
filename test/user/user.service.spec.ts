import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../src/user/user.service';
import { User } from '../../src/user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto, AccountType } from '../../src/user/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';

jest.mock('bcrypt');
jest.mock('uuid', () => ({ v4: jest.fn(() => 'test-uuid') }));

describe('createAccount', () => {
    let service: UserService;
    let userRepository: Repository<User>;
  
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UserService,
          {
            provide: getRepositoryToken(User),
            useValue: {
              findOne: jest.fn(),
              create: jest.fn(),
              save: jest.fn(),
            },
          },
        ],
      }).compile();
  
      service = module.get<UserService>(UserService);
      userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    const createUserDto: CreateUserDto = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      aadhaarNumber: '123456789012',
      accountType: AccountType.Savings,
      branch: 'Main Branch',
    };

    it('should successfully create a new account', async () => {
      const mockUser = { ...createUserDto, id: 'test-uuid', accountNumber: '1234567890123456', balance: 500 };
      const pin = '1234';
      const hashedPin = 'hashedPin';

      (userRepository.findOne as jest.Mock).mockResolvedValue(null);
      (userRepository.create as jest.Mock).mockReturnValue(mockUser);
      (userRepository.save as jest.Mock).mockResolvedValue(mockUser);
      
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPin);

      jest.spyOn(service as any, 'genarateAccoutNumber').mockReturnValue('1234567890123456');
      jest.spyOn(service as any, 'genaratePin').mockReturnValue(pin);
      jest.spyOn(service as any, 'hashPin').mockResolvedValue(hashedPin);

      const result = await service.createAccount(createUserDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: [{ email: createUserDto.email }, { aadhaarNumber: createUserDto.aadhaarNumber }],
      });
      expect(userRepository.create).toHaveBeenCalledWith({
        id: 'test-uuid',
        name: createUserDto.name,
        email: createUserDto.email,
        aadhaarNumber: createUserDto.aadhaarNumber,
        accountType: createUserDto.accountType,
        branch: createUserDto.branch,
        accountNumber: '1234567890123456',
        pin: hashedPin,
        balance: 500,
      });
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({ user: mockUser, pin });
    });

    it('should throw BadRequestException if user with same email or Aadhaar exists', async () => {
        const existingUser = { id: 'existing-user-id', ...createUserDto };
      
        (userRepository.findOne as jest.Mock).mockResolvedValue(existingUser);
      
        await expect(service.createAccount(createUserDto)).rejects.toThrow(BadRequestException);
        expect(userRepository.findOne).toHaveBeenCalledWith({
          where: [{ email: createUserDto.email }, { aadhaarNumber: createUserDto.aadhaarNumber }],
        });
      });
      

    it('should throw an error if account creation fails', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockRejectedValue(new Error('Hashing failed'));

      jest.spyOn(service as any, 'genarateAccoutNumber').mockReturnValue('1234567890123456');
      jest.spyOn(service as any, 'genaratePin').mockReturnValue('1234');

      await expect(service.createAccount(createUserDto)).rejects.toThrow('Account creation failed');
    });
  });
