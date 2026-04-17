import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UsersRepository } from '../users/users.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Rely natively on usersService to properly hash the credential and abstract creation correctly
    const user = await this.usersService.create(dto);
    // const payload = { sub: user.id, email: user.email };
    return {
      user,
      //accessToken: this.jwtService.sign(payload),
    };
  }

  async login(dto: LoginDto) {
    // 1. We must fetch the user explicitly including the select: false authCredential
    const userEntity = await this.usersRepository.findByEmailWithAuth(
      dto.email,
    );

    if (!userEntity || !userEntity.authCredential) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Validate BCrypt payload safely
    const isMatched = await bcrypt.compare(
      dto.authCredential,
      userEntity.authCredential,
    );
    if (!isMatched) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Generate structured JWT correctly
    const payload = { sub: userEntity.id, email: userEntity.email };

    // Strip credential back down passing safely isolated metadata completely
    const { authCredential, ...secureUser } = Object.assign({}, userEntity);

    return {
      user: secureUser, // Exclude credential
      accessToken: this.jwtService.sign(payload),
    };
  }
}
