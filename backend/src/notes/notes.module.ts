import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { NotesRepository } from './notes.repository';
import { NoteEntity } from './entities/note.entity';
import { KeySlotEntity } from './entities/key-slot.entity';
import { NoteVersionEntity } from './entities/note-version.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NoteEntity, KeySlotEntity, NoteVersionEntity])],
  controllers: [NotesController],
  providers: [NotesService, NotesRepository],
  exports: [NotesService],
})
export class NotesModule {}
