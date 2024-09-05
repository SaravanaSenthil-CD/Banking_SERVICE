import { Module } from '@nestjs/common';
import { TransactionModule } from './transaction/transaction.module';
import { UserModule } from './user/user.module';
// import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './dbconfig/typeOrm.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(typeOrmConfig),
    TransactionModule,
    UserModule,
    // AuthModule,
    MailModule,
  ],
})
export class AppModule {}
