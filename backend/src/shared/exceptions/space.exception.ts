import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { SPACE_ERROR_MESSAGES } from '../../spaces/constants/spaces.constants';

export class SpaceNotFoundException extends NotFoundException {
  constructor() {
    super(SPACE_ERROR_MESSAGES.NOT_FOUND);
  }
}

export class SpacePermissionException extends ForbiddenException {
  constructor() {
    super(SPACE_ERROR_MESSAGES.PERMISSION_DENIED);
  }
}

export class SpaceMemberExistsException extends ConflictException {
  constructor() {
    super(SPACE_ERROR_MESSAGES.MEMBER_ALREADY_EXISTS);
  }
}

export class SpaceMemberNotFoundException extends NotFoundException {
  constructor() {
    super(SPACE_ERROR_MESSAGES.MEMBER_NOT_FOUND);
  }
}

export class SpaceCannotAddMemberException extends BadRequestException {
  constructor() {
    super(SPACE_ERROR_MESSAGES.CANNOT_ADD_MEMBER_TO_PERSONAL);
  }
}

export class SpaceCannotRemoveOwnerException extends BadRequestException {
  constructor() {
    super(SPACE_ERROR_MESSAGES.CANNOT_REMOVE_OWNER);
  }
}
