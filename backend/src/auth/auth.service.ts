import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AUTH_ERROR_MESSAGES } from './constants/auth.constants';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Rely natively on usersService to properly hash the credential and abstract creation correctly
    const user = await this.usersService.create(dto);

    const payload = { sub: user.id, email: user.email };

    return {
      user,
      accessToken: this.jwtService.sign(payload),
    };
  }

  async login(dto: LoginDto) {
    // 1. We must fetch the user explicitly including the select: false authCredential
    const userWithAuth = await this.usersService.findByEmailWithAuth(
      dto.email,
    );

    if (!userWithAuth?.authCredential) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // 2. Validate BCrypt payload safely
    const isMatched = await bcrypt.compare(
      dto.authCredential,
      userWithAuth.authCredential,
    );
    if (!isMatched) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // 3. Generate structured JWT correctly
    const payload = { sub: userWithAuth.id, email: userWithAuth.email };

    // Strip credential back down passing safely isolated metadata completely
    const { authCredential, ...secureUser } = Object.assign({}, userWithAuth);

    return {
      user: secureUser, // Exclude credential
      accessToken: this.jwtService.sign(payload),
    };
  }
}
