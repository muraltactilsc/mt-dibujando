import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { AuthUser } from '@dibujando/shared';
import type { Request } from 'express';
import { jwtVerify } from 'jose';

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('No se encontró un token de autenticación válido.');
    }

    const token = authHeader.slice('Bearer '.length);
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new UnauthorizedException('JWT_SECRET is not configured');
    }

    try {
      const result = await jwtVerify(token, new TextEncoder().encode(secret), {
        algorithms: ['HS256'],
      });
      const payload = result.payload as Record<string, unknown>;

      request.user = {
        userProfileId: 0,
        oscProfileId: null,
        internalId: typeof payload.sub === 'string' ? payload.sub : '',
        institutionName: '',
        role: payload.role == null || typeof payload.role !== 'string' ? null : payload.role,
        countryId: null,
      };
      return true;
    } catch {
      throw new UnauthorizedException('El token de autenticación es inválido o ha expirado.');
    }
  }
}
