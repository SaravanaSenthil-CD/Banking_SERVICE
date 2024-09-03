import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { AccountType, CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

interface CreateAccountResponse {
  user: User;
  pin: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly UserRepositry: Repository<User>,
  ) {}

  async createAccount(
    CreateUserDto: CreateUserDto,
  ): Promise<CreateAccountResponse> {
    try {
      const { name, email, aadhaarNumber, accountType, branch } = CreateUserDto;

      const existingUser = await this.UserRepositry.findOne({
        where: [{ email }, { aadhaarNumber }],
      });

      if (existingUser) {
        throw new BadRequestException(
          'User with this email or Aadhaar number already exists.',
        );
      }

      const accountNumber = this.genarateAccoutNumber();

      const pin = this.genaratePin();

      const hashedPin = await this.hashPin(pin);

      const initialBalance =
        accountType == AccountType.Savings ? Math.floor(500) : 0;

      const user = this.UserRepositry.create({
        id: uuidv4(),
        name,
        email,
        aadhaarNumber,
        accountType,
        branch,
        accountNumber,
        pin: hashedPin,
        balance: initialBalance,
      });

      const savedUser = await this.UserRepositry.save(user);
      return { user: savedUser, pin };
    } catch (error) {
      throw new Error('');
    }
  }

  private genarateAccoutNumber(): string {
    return Array(16)
      .fill(0)
      .map(() => Math.floor(Math.random() * 10))
      .join('');
  }

  private genaratePin(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  private async hashPin(pin: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(pin, salt);
  }
}
