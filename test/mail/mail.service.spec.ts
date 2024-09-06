import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { MailService } from '../../src/mail/mail.service';
import { Logger } from '@nestjs/common';

describe('MailService', () => {
    let mailService: MailService;
    let mailerService: MailerService;
    let logger: Logger;
  
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MailService,
          {
            provide: MailerService,
            useValue: {
              sendMail: jest.fn(),
            },
          },
          Logger,
        ],
      }).compile();
  
      mailService = module.get<MailService>(MailService);
      mailerService = module.get<MailerService>(MailerService);
  
      jest.spyOn(mailService['logger'], 'log').mockImplementation(() => {});
      jest.spyOn(mailService['logger'], 'error').mockImplementation(() => {});
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
      it('should send transaction confirmation email successfully', async () => {
        const email = 'test@example.com';
        const transactionType = 'Credit';
        const amount = 1000;
        const balanceAfterTransaction = 2000;
  
        await mailService.sendTransactionConfirmation(
          email,
          transactionType,
          amount,
          balanceAfterTransaction,
        );
  
        expect(mailerService.sendMail).toHaveBeenCalledWith({
          to: email,
          subject: `Transaction ${transactionType} Confirmation for your account`,
          html: expect.any(String),
        });
        expect(mailService['logger'].log).toHaveBeenCalledWith(
          `Transaction confirmation sent to ${email}`,
        );
      });
    

    
        it('should send transaction logs email successfully', async () => {
          const email = 'test@example.com';
          const transactionCount = 5;
    
          
          await mailService.sendTransactionLogs(email, transactionCount);
    
          expect(mailerService.sendMail).toHaveBeenCalledWith({
            to: email,
            subject: 'Your Transaction Logs',
            html: expect.any(String),
          });
          expect(mailService['logger'].log).toHaveBeenCalledWith(
            `Transaction logs sent to ${email}`,
          );
        });
            it('should send transaction logs email successfully', async () => {
              // Arrange
              const email = 'test@example.com';
              const transactionCount = 5;
        
              // Act
              await mailService.sendTransactionLogs(email, transactionCount);
        
              // Assert
              expect(mailerService.sendMail).toHaveBeenCalledWith({
                to: email,
                subject: 'Your Transaction Logs',
                html: expect.any(String),
              });
              expect(mailService['logger'].log).toHaveBeenCalledWith(
                `Transaction logs sent to ${email}`,
              );
            });   
}) 