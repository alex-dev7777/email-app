import { Controller, Post, Get, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { SendEmailDto, SendBulkEmailDto, TestEmailDto } from './dto/send-email.dto';

@ApiTags('email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('status')
  @ApiOperation({ summary: 'Check SMTP connection status' })
  @ApiResponse({ status: 200, description: 'SMTP connection information' })
  async getStatus() {
    try {
      const info = await this.emailService.getConnectionInfo();
      return {
        status: 'success',
        data: info,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to get SMTP status',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('send')
  @ApiOperation({ summary: 'Send single email' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  async sendEmail(@Body() dto: SendEmailDto) {
    try {
      const result = await this.emailService.sendEmail(dto);
      return {
        status: 'success',
        message: 'Email sent successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to send email',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('send-bulk')
  @ApiOperation({ summary: 'Send bulk emails' })
  @ApiResponse({ status: 200, description: 'Bulk email process completed' })
  async sendBulkEmail(@Body() dto: SendBulkEmailDto) {
    try {
      const result = await this.emailService.sendBulkEmail(dto);
      return {
        status: 'success',
        message: 'Bulk email process completed',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to send bulk emails',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('test')
  @ApiOperation({ summary: 'Send test email' })
  @ApiResponse({ status: 200, description: 'Test email sent' })
  async sendTestEmail(@Body() dto: TestEmailDto) {
    try {
      const result = await this.emailService.sendTestEmail(dto.to);
      return {
        status: 'success',
        message: 'Test email sent successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to send test email',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}