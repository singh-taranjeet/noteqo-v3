import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { User } from './types/users.types';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  UserNotFoundException,
  UserEmailExistsException,
} from '../shared/exceptions/user.exception';
import { USER_CONSTANTS } from './constants/users.constants';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly usersRepository: UsersRepository) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new UserEmailExistsException();
    }

    const hashedCredential = await bcrypt.hash(
      dto.authCredential,
      USER_CONSTANTS.AUTH_SALT_ROUNDS,
    );

    this.logger.log(`Creating user with email ${dto.email}`);

    return this.usersRepository.create({
      ...dto,
      authCredential: hashedCredential,
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException();
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundException();
    }
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException();
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.usersRepository.findByEmail(dto.email);
      if (existing) {
        throw new UserEmailExistsException();
      }
    }

    const updateData: Partial<UserEntity> = { ...dto };

    if (dto.authCredential) {
      updateData.authCredential = await bcrypt.hash(
        dto.authCredential,
        USER_CONSTANTS.AUTH_SALT_ROUNDS,
      );
    }

    this.logger.log(`Updating user ${id}`);

    return this.usersRepository.update(id, updateData);
  }

  async remove(id: string): Promise<void> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException();
    }

    this.logger.log(`Deleting user ${id}`);
    await this.usersRepository.delete(id);
  }
}
