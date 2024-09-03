import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userservice: UserService) {}

  @Post('create')
  async createAccount(
    @Body() CreateUserDto: CreateUserDto,
  ): Promise<{ user: User; pin: string }> {
    return this.userservice.createAccount(CreateUserDto);
  }
}
