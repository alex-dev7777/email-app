import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { TokenService } from '../unsubscribe/token.service';

@Module({
  controllers: [EmailController],
  providers: [EmailService, TokenService],
  exports: [EmailService],
})
export class EmailModule {}