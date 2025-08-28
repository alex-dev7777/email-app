import { Controller, Get, Post, Param, Query, Res, HttpCode } from '@nestjs/common';
import { Response } from 'express';
import { UnsubscribeService } from './unsubscribe.service';

@Controller()
export class UnsubscribeController {
  constructor(private svc: UnsubscribeService) {}

  // Видимая ссылка из письма
  @Get('u/:token')
  async viaLink(@Param('token') token: string, @Res() res: Response) {
    const ok = this.svc.markByToken(token);
    return res.status(ok ? 200 : 400).send(ok ? 'Вы отписаны от рассылки.' : 'Неверный/истёкший токен.');
  }

  // One-Click: провайдер делает POST /unsubscribe/one-click?t=<token>
  @Post('unsubscribe/one-click')
  @HttpCode(204)
  async oneClick(@Query('t') token: string) {
    // тело: { 'List-Unsubscribe': 'One-Click' } — нам не нужно
    const ok = this.svc.markByToken(token);
    // 204 обязателен по RFC 8058
    return;
  }
}