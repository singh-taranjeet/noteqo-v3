import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AUTH_ROUTES } from './constants/auth.constants';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { User } from '../users/types/users.types';

@Controller(AUTH_ROUTES.BASE)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(AUTH_ROUTES.REGISTER)
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    const result = await this.authService.register(dto);
    return {
      user: this.mapUserToResponse(result.user),
      accessToken: result.accessToken,
    };
  }

  @Post(AUTH_ROUTES.LOGIN)
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    const result = await this.authService.login(dto);
    return {
      user: this.mapUserToResponse(result.user),
      accessToken: result.accessToken,
    };
  }

  private mapUserToResponse(
    user: User | Omit<User, 'authCredential'>,
  ): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      publicKey: user.publicKey,
      privateKey: user.privateKey,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      createdBy: user.createdBy,
      updatedBy: user.updatedBy,
      deletedBy: user.deletedBy,
    };
  }
}
