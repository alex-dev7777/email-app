import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class TokenService {
  private readonly secret = process.env.UNSUBSCRIBE_SECRET || 'change-me';

  sign(payload: Record<string, any>): string {
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const sig = crypto.createHmac('sha256', this.secret).update(body).digest('base64url');
    return `${body}.${sig}`;
  }

  verify(token: string): Record<string, any> | null {
    const [body, sig] = (token || '').split('.');
    if (!body || !sig) return null;
    const exp = crypto.createHmac('sha256', this.secret).update(body).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(exp))) return null;
    try { return JSON.parse(Buffer.from(body, 'base64url').toString()); } catch { return null; }
  }
}