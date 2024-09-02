import { Module } from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { TransactionModule } from './transaction/transaction.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    AccountModule,
    TransactionModule,
    UserModule,
    AuthModule,
    MailModule,
  ],
})
export class AppModule {}
