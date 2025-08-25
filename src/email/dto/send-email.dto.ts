import { IsEmail, IsString, IsNotEmpty, IsOptional, IsArray, ArrayMinSize, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ example: 'Test Email Subject' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ example: '<h1>Hello</h1><p>This is HTML content</p>' })
  @IsString()
  @IsNotEmpty()
  html: string;

  @ApiProperty({ example: 'Plain text content', required: false })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiProperty({ example: 'Sender Name', required: false })
  @IsString()
  @IsOptional()
  fromName?: string;
}

export class SendBulkEmailDto {
  @ApiProperty({ 
    example: ['user1@example.com', 'user2@example.com'],
    type: [String]
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEmail({}, { each: true })
  to: string[];

  @ApiProperty({ example: 'Bulk Email Subject' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ example: '<h1>Bulk Email</h1><p>Content for all recipients</p>' })
  @IsString()
  @IsNotEmpty()
  html: string;

  @ApiProperty({ example: 'Plain text content', required: false })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiProperty({ example: 1000, description: 'Delay in ms between emails', required: false })
  @IsNumber()
  @IsOptional()
  delay?: number;
}

export class TestEmailDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsEmail()
  @IsNotEmpty()
  to: string;
}