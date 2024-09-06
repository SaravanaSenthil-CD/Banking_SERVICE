import { Body, Controller, Post, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body('accountNumber') accountNumber: string,
    @Body('pin') pin: string,
  ) {
  try {
      const result = await this.authService.logIn(accountNumber, pin);
      this.logger.log(`Login successful for account number: ${accountNumber}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Login failed for account number: ${accountNumber}. Error: ${error.message}`,
        error.stack,
      ); 
      throw new UnauthorizedException('Login failed, please check your credentials');
    }
  }
}
