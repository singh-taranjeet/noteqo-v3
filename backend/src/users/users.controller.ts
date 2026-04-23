import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { User } from './types/users.types';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { USER_ROUTES } from './constants/users.constants';

@Controller(USER_ROUTES.BASE)
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.create(createUserDto);
    return this.mapToResponse(user);
  }

  @Get(USER_ROUTES.PUBLIC_KEY)
  async getPublicKey(
    @Query('email') email: string,
  ): Promise<{ publicKey: string }> {
    const user = await this.usersService.findByEmail(email);
    return { publicKey: user.publicKey ?? '' };
  }

  @Get(USER_ROUTES.BY_ID)
  async findOne(
    @Param('userId', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(id);
    return this.mapToResponse(user);
  }

  @Patch(USER_ROUTES.BY_ID)
  async update(
    @Param('userId', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.update(id, updateUserDto);
    return this.mapToResponse(user);
  }

  @Delete(USER_ROUTES.BY_ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('userId', ParseUUIDPipe) id: string): Promise<void> {
    await this.usersService.remove(id);
  }



  private mapToResponse(user: User): UserResponseDto {
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
