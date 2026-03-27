import { NotFoundException, ConflictException } from '@nestjs/common';
import { USER_ERROR_MESSAGES } from '../../users/constants/users.constants';

export class UserNotFoundException extends NotFoundException {
  constructor() {
    super(USER_ERROR_MESSAGES.NOT_FOUND);
  }
}

export class UserEmailExistsException extends ConflictException {
  constructor() {
    super(USER_ERROR_MESSAGES.EMAIL_EXISTS);
  }
}
