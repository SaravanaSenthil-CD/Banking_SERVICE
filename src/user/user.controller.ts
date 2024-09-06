import { Body, Controller, Post, Logger, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userservice: UserService) {}

  @Post('create')
  async createAccount(
    @Body() CreateUserDto: CreateUserDto,
  ): Promise<{ user: User; pin: string }> {

    try {
      const result = await this.userservice.createAccount(CreateUserDto);
      this.logger.log(`Account created successfully for email: ${CreateUserDto.email}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to create account for email: ${CreateUserDto.email}. Error: ${error.message}`, 
        error.stack,
      ); 
      throw new BadRequestException('Account creation failed');
    }
  }
}
