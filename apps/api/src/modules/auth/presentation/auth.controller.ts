import { Body, Controller, Get, Post, Req, UseFilters, UseGuards } from '@nestjs/common';
import {
  LoginBodySchema,
  LogoutBodySchema,
  RefreshBodySchema,
  RegisterBodySchema,
} from '@dibujando/shared';
import type { AuthUser, RegisterBody } from '@dibujando/shared';
import type { Request } from 'express';
import { AuthService } from '../application/auth.service';
import { JwtAuthGuard } from '../../../shared/jwt-auth.guard';
import { ZodValidationPipe } from '../../../shared/zod-validation.pipe';
import { AuthExceptionFilter } from './auth-exception.filter';

interface AuthRequest extends Request {
  user?: AuthUser;
}

@Controller('api/auth')
@UseFilters(AuthExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body(new ZodValidationPipe(LoginBodySchema)) body: { email: string; password: string },
  ) {
    const result = await this.authService.login(body.email, body.password);
    return { success: true, data: result };
  }

  @Post('register')
  async register(@Body(new ZodValidationPipe(RegisterBodySchema)) body: RegisterBody) {
    const result = await this.authService.register(body);
    return { success: true, data: result };
  }

  @Post('refresh')
  async refresh(@Body(new ZodValidationPipe(RefreshBodySchema)) body: { refreshToken: string }) {
    const result = await this.authService.refresh(body.refreshToken);
    return { success: true, data: result };
  }

  @Post('logout')
  async logout(@Body(new ZodValidationPipe(LogoutBodySchema)) body: { refreshToken: string }) {
    await this.authService.logout(body.refreshToken);
    return { success: true, data: {} };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() request: AuthRequest) {
    const user = request.user;
    if (!user) {
      return { success: false, error: { code: 'unauthenticated', message: 'Unauthorized' } };
    }
    const refreshed = await this.authService.me(user.internalId);
    return { success: true, data: { user: refreshed } };
  }
}
