import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../../src/user/user.controller';
import { UserService } from '../../src/user/user.service';
import { AccountType, CreateUserDto } from '../../src/user/dto/create-user.dto';
import { BadRequestException } from '@nestjs/common';

describe('UserController', () => {
    let controller: UserController;
    let service: UserService;
  
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [UserController],
        providers: [
          {
            provide: UserService,
            useValue: {
              createAccount: jest.fn(),
            },
          },
        ],
      }).compile();
  
      controller = module.get<UserController>(UserController);
      service = module.get<UserService>(UserService);
    });
  
    describe('createAccount', () => {
      const createUserDto: CreateUserDto = {
        name: 'saravana',
        email: 'saravana@example.com',
        aadhaarNumber: '123456789012',
        accountType: AccountType.Savings,
        branch: 'Kovilpatti',
      };
  
      it('should successfully create an account', async () => {
        const mockUser = { ...createUserDto, id: 'test-uuid', accountNumber: '1234567890123456', balance: 500 };
        const pin = '1234';

        (service.createAccount as jest.Mock).mockResolvedValue({ user: mockUser, pin });
  
        const result = await controller.createAccount(createUserDto);
        expect(result).toEqual({ user: mockUser, pin });
        expect(service.createAccount).toHaveBeenCalledWith(createUserDto);
      });
  
      it('should throw BadRequestException when account creation fails', async () => {
        (service.createAccount as jest.Mock).mockRejectedValue(new Error('Account creation failed'));
        await expect(controller.createAccount(createUserDto)).rejects.toThrow(BadRequestException);
        expect(service.createAccount).toHaveBeenCalledWith(createUserDto);
      });
    });
  });