import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket!: Socket;
  private currentRoom: string = '';
  private syncSubject = new Subject<{ content: string; lastModified: Date }>();

  connect(url: string): void {
    this.socket = io(url, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Listen for sync events
    this.socket.on('sync', (data: { content: string; lastModified: Date }) => {
      this.syncSubject.next(data);
    });

    // Listen for errors
    this.socket.on('error', (error: string) => {
      console.error('Socket error:', error);
    });
  }

  joinRoom(roomId: string): void {
    this.currentRoom = roomId;
    this.socket.emit('join', roomId);
  }

  syncContent(content: string): void {
    this.socket.emit('sync', {
      roomId: this.currentRoom,
      content
    });
  }

  onSync(): Observable<{ content: string; lastModified: Date }> {
    return this.syncSubject.asObservable();
  }

  leaveRoom(): void {
    if (this.currentRoom) {
      this.socket.emit('leave', this.currentRoom);
      this.currentRoom = '';
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.leaveRoom();
      this.socket.disconnect();
    }
  }
}
