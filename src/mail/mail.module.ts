import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service:'gmail',
        host: 'smtp.gmail.com',
        port: 587, 
        secure: false,
        auth: {
          user: 'rlsaravanalogesh@gmail.com', 
          pass: 'eaof gkpi boyf gshz', 
        },
      },
      defaults: {
        from:{
          name:'KDFC BANK',
          address:'rlsaravanalogesh@gmail.com'
        }, 
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
