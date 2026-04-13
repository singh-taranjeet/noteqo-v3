import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { NOTE_ERROR_MESSAGES } from '../../notes/constants/notes.constants';

export class NoteNotFoundException extends NotFoundException {
  constructor() {
    super(NOTE_ERROR_MESSAGES.NOT_FOUND);
  }
}

// TODO implement later
// export class NotePermissionException extends ForbiddenException {
//   constructor() {
//     super(NOTE_ERROR_MESSAGES.PERMISSION_DENIED);
//   }
// }
