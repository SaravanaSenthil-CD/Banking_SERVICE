import { IsString, IsEmail, IsEnum, Length, Matches } from 'class-validator';

export enum AccountType {
  Savings = 'Savings',
  Current = 'Current',
}

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^[0-9]{12}$/, { message: 'Aadhaar number must be 12 digits long' })
  aadhaarNumber: string;

  @IsEnum(AccountType)
  accountType: AccountType;

  @IsString()
  branch: string;
}
