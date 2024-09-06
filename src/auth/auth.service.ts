import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(accountNumber: string, pin: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { accountNumber } });

    if (user && (await bcrypt.compare(pin, user.pin))) {
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async logIn(accountNumber: string, pin: string) {
    const user = await this.validateUser(accountNumber, pin);
    const payload = { sub: user.id, accountNumber: user.accountNumber };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
