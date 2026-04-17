import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { User } from './types/users.types';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly orm: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const entity = await this.orm.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.orm.findOne({ where: { email } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmailWithAuth(email: string): Promise<UserEntity | null> {
    return this.orm.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'name',
        'authCredential',
        'publicKey',
        'privateKey',
        'createdAt',
        'updatedAt',
        'createdBy',
        'updatedBy',
        'deletedBy',
      ],
    });
  }

  async create(user: CreateUserDto): Promise<User> {
    const entity = this.orm.create({
      ...user,
    });
    const saved = await this.orm.save(entity);
    return this.toDomain(saved);
  }

  async update(id: string, data: Partial<UserEntity>): Promise<User> {
    await this.orm.update(id, data);
    return this.findById(id) as Promise<User>;
  }

  async delete(id: string): Promise<void> {
    await this.orm.softDelete(id);
  }

  private toDomain(entity: UserEntity): User {
    return {
      id: entity.id,
      email: entity.email,
      name: entity.name,
      publicKey: entity.publicKey,
      privateKey: entity.privateKey,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
      deletedBy: entity.deletedBy,
    };
  }
}
