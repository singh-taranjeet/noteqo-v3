import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { NOTE_ERROR_MESSAGES } from '../../notes/constants/notes.constants';
import { Note } from '../../notes/types/notes.types';

export class NoteNotFoundException extends NotFoundException {
  constructor() {
    super(NOTE_ERROR_MESSAGES.NOT_FOUND);
  }
}

/**
 * Thrown when a note update's baseVersion doesn't match the server's current version.
 * Returns 409 Conflict with the current server note attached so the client
 * can create a conflict copy and pull the latest version.
 */
export class NoteConflictException extends ConflictException {
  constructor(currentNote: Note) {
    super({
      message: NOTE_ERROR_MESSAGES.CONFLICT,
      details: currentNote,
    });
  }
}

// TODO implement later
// export class NotePermissionException extends ForbiddenException {
//   constructor() {
//     super(NOTE_ERROR_MESSAGES.PERMISSION_DENIED);
//   }
// }
