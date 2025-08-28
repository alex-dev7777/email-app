import { Module } from '@nestjs/common';
import { UnsubscribeController } from './unsubscribe.controller';
import { UnsubscribeService } from './unsubscribe.service';
import { TokenService } from './token.service';

@Module({
  controllers: [UnsubscribeController],
  providers: [UnsubscribeService, TokenService],
  exports: [UnsubscribeService, TokenService],
})
export class UnsubscribeModule {}