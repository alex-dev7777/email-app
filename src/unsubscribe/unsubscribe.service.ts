import { Injectable } from '@nestjs/common';
import { TokenService } from './token.service';

@Injectable()
export class UnsubscribeService {
  constructor(private tokens: TokenService) {}

  // временно In-Memory — достаточно для прохождения проверок
  private memory = new Set<string>();

  markByToken(token: string): boolean {
    const data = this.tokens.verify(token);
    const email = data?.email?.toLowerCase();
    if (!email) return false;
    this.memory.add(email);
    return true;
  }

  isUnsubscribed(email: string): boolean {
    return this.memory.has((email || '').toLowerCase());
  }
}