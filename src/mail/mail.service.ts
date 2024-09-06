import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as nodemalier from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendTransactionConfirmation(
    email: string,
    transactionType: string,
    amount: number,
    balanceAfterTransaction: number,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `Transaction ${transactionType} Confirmation for your account`,
        html: `
          <p>Hello,</p>
          <p>Your ${transactionType} transaction of amount ${amount} has been successfully processed.</p>
          <p>Your balance after this transaction is ${balanceAfterTransaction}.</p>
          <p>Thank you for using our service!</p>
        `,
      });
      this.logger.log(`Transaction confirmation sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send transaction confirmation to ${email}`, error);
    }
  }

  async sendTransactionLogs(email: string, transactionCount: number): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Your Transaction Logs',
        html: `
          <p>Hello,</p>
          <p>Your transaction logs have been successfully generated.</p>
          <p>Total number of transactions: ${transactionCount}.</p>
          <p>Thank you for using our service!</p>
        `,
      });
      this.logger.log(`Transaction logs sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send transaction logs to ${email}`, error);
    }
  }
}
