import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class WithdrawAmountDto {
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  pin: string;

  @IsNumber()
  @Min(1)
  amount: number;
}
