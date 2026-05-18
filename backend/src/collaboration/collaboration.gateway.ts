import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { CollaborationService } from './collaboration.service';
import {
  COLLABORATION_CONFIG,
  COLLABORATION_EVENTS,
} from './constants/collaboration.constants';
import type {
  JoinNotePayload,
  LeaveNotePayload,
  SendUpdatePayload,
  RequestCatchupPayload,
  AwarenessPayload,
  SocketAuthData,
  RoomUser,
} from './types/collaboration.types';

/**
 * WebSocket gateway for real-time collaborative editing.
 *
 * Handles:
 * 1. JWT authentication on connection
 * 2. Room management per noteId
 * 3. Receiving encrypted Yjs updates → persist → broadcast to room
 * 4. Catch-up for clients reconnecting after being offline
 * 5. Awareness (cursor positions) relay
 *
 * The server is a DUMB RELAY — it never decrypts Yjs updates.
 * All CRDT merge logic runs client-side.
 */
@WebSocketGateway({
  namespace: COLLABORATION_CONFIG.NAMESPACE,
  cors: {
    origin: COLLABORATION_CONFIG.CORS_ORIGIN,
    credentials: true,
  },
})
export class CollaborationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CollaborationGateway.name);

  /** Maps socket.id → authenticated user data */
  private readonly socketUsers = new Map<string, SocketAuthData>();

  /** Maps noteId → Set of socket.ids currently in the room */
  private readonly noteRooms = new Map<string, Set<string>>();

  constructor(
    private readonly collaborationService: CollaborationService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit(): void {
    this.logger.log('Collaboration WebSocket gateway initialized');
  }

  /**
   * Authenticates the WebSocket connection using a JWT token
   * passed as a query parameter or in the auth handshake.
   */
  handleConnection(client: Socket): void {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.query?.token as string);

      if (!token) {
        this.logger.warn(
          `Connection rejected: no token (socket ${client.id})`,
        );
        client.disconnect();
        return;
      }

      const decoded = this.jwtService.verify(token);
      const authData: SocketAuthData = {
        userId: decoded.sub,
        email: decoded.email,
      };

      this.socketUsers.set(client.id, authData);
      this.logger.log(
        `User ${authData.userId} connected (socket ${client.id})`,
      );
    } catch (err) {
      this.logger.warn(
        `Connection rejected: invalid token (socket ${client.id})`,
      );
      client.disconnect();
    }
  }

  /**
   * Cleans up when a client disconnects.
   * Removes from all note rooms and notifies remaining users.
   */
  handleDisconnect(client: Socket): void {
    const authData = this.socketUsers.get(client.id);
    if (!authData) return;

    // Remove from all rooms this socket was in
    for (const [noteId, members] of this.noteRooms.entries()) {
      if (members.has(client.id)) {
        members.delete(client.id);

        // Notify remaining users and updated list
        client.to(this.getRoomName(noteId)).emit(COLLABORATION_EVENTS.USER_LEFT, {
          noteId,
          userId: authData.userId,
        });
        
        const roomUsers = this.getRoomUsers(noteId);
        this.server.to(this.getRoomName(noteId)).emit(COLLABORATION_EVENTS.ROOM_USERS, {
          noteId,
          users: roomUsers,
        });

        // Clean up empty rooms
        if (members.size === 0) {
          this.noteRooms.delete(noteId);
        }
      }
    }

    this.socketUsers.delete(client.id);
    this.logger.log(
      `User ${authData.userId} disconnected (socket ${client.id})`,
    );
  }

  /**
   * Client joins a note room for collaborative editing.
   * Returns the list of users currently in the room.
   */
  @SubscribeMessage(COLLABORATION_EVENTS.JOIN_NOTE)
  handleJoinNote(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinNotePayload,
  ): void {
    const authData = this.socketUsers.get(client.id);
    if (!authData) return;

    const roomName = this.getRoomName(payload.noteId);
    client.join(roomName);

    // Track membership
    if (!this.noteRooms.has(payload.noteId)) {
      this.noteRooms.set(payload.noteId, new Set());
    }
    this.noteRooms.get(payload.noteId)!.add(client.id);

    // Notify others that a user joined
    client.to(roomName).emit(COLLABORATION_EVENTS.USER_JOINED, {
      noteId: payload.noteId,
      userId: authData.userId,
    });

    // Send current room users to everyone in the room
    const roomUsers = this.getRoomUsers(payload.noteId);
    this.server.to(roomName).emit(COLLABORATION_EVENTS.ROOM_USERS, {
      noteId: payload.noteId,
      users: roomUsers,
    });

    this.logger.debug(
      `User ${authData.userId} joined note ${payload.noteId} (${roomUsers.length} users)`,
    );
  }

  /**
   * Client leaves a note room.
   */
  @SubscribeMessage(COLLABORATION_EVENTS.LEAVE_NOTE)
  handleLeaveNote(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: LeaveNotePayload,
  ): void {
    const authData = this.socketUsers.get(client.id);
    if (!authData) return;

    const roomName = this.getRoomName(payload.noteId);
    client.leave(roomName);

    const members = this.noteRooms.get(payload.noteId);
    if (members) {
      members.delete(client.id);
      if (members.size === 0) {
        this.noteRooms.delete(payload.noteId);
      }
    }

    // Notify remaining users and broadcast updated user list
    client.to(roomName).emit(COLLABORATION_EVENTS.USER_LEFT, {
      noteId: payload.noteId,
      userId: authData.userId,
    });
    const roomUsers = this.getRoomUsers(payload.noteId);
    this.server.to(roomName).emit(COLLABORATION_EVENTS.ROOM_USERS, {
      noteId: payload.noteId,
      users: roomUsers,
    });

    this.logger.debug(
      `User ${authData.userId} left note ${payload.noteId}`,
    );
  }

  /**
   * Client sends an encrypted Yjs update.
   * Server persists it and relays to all other clients in the room.
   */
  @SubscribeMessage(COLLABORATION_EVENTS.SEND_UPDATE)
  async handleSendUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendUpdatePayload,
  ): Promise<void> {
    const authData = this.socketUsers.get(client.id);
    if (!authData) return;

    // Persist the encrypted update and get sequence number
    const relayPayload = await this.collaborationService.persistUpdate(
      payload.noteId,
      payload.encryptedUpdate,
      authData.userId,
    );

    // Relay to all OTHER clients in the room (not back to sender)
    client
      .to(this.getRoomName(payload.noteId))
      .emit(COLLABORATION_EVENTS.RECEIVE_UPDATE, relayPayload);
  }

  /**
   * Client requests missed updates for catch-up after reconnect.
   * Returns all updates after the given sequence number.
   */
  @SubscribeMessage(COLLABORATION_EVENTS.REQUEST_CATCHUP)
  async handleRequestCatchup(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: RequestCatchupPayload,
  ): Promise<void> {
    const authData = this.socketUsers.get(client.id);
    if (!authData) return;

    const updates = await this.collaborationService.getCatchupUpdates(
      payload.noteId,
      payload.lastSequenceNumber,
      authData.userId,
    );

    client.emit(COLLABORATION_EVENTS.CATCHUP_UPDATES, {
      noteId: payload.noteId,
      updates,
    });

    this.logger.debug(
      `Sent ${updates.length} catch-up updates to user ${authData.userId} for note ${payload.noteId}`,
    );
  }

  /**
   * Client broadcasts encrypted awareness state (cursor position, user info).
   * Server relays to all other clients in the room — no persistence needed.
   */
  @SubscribeMessage(COLLABORATION_EVENTS.SEND_AWARENESS)
  handleSendAwareness(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: AwarenessPayload,
  ): void {
    const authData = this.socketUsers.get(client.id);
    if (!authData) return;

    // Relay awareness to all OTHER clients (ephemeral, not persisted)
    client
      .to(this.getRoomName(payload.noteId))
      .emit(COLLABORATION_EVENTS.RECEIVE_AWARENESS, payload);
  }

  // ─── Private Helpers ──────────────────────────────────────────

  private getRoomName(noteId: string): string {
    return `${COLLABORATION_CONFIG.ROOM_PREFIX}:${noteId}`;
  }

  private getRoomUsers(noteId: string): RoomUser[] {
    const members = this.noteRooms.get(noteId);
    if (!members) return [];

    const uniqueUsers = new Map<string, RoomUser>();
    for (const socketId of members) {
      const authData = this.socketUsers.get(socketId);
      if (authData && !uniqueUsers.has(authData.userId)) {
        uniqueUsers.set(authData.userId, {
          userId: authData.userId,
          joinedAt: new Date().toISOString(),
        });
      }
    }
    return Array.from(uniqueUsers.values());
  }
}
