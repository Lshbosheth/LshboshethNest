import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class SocketService {
  emitMessage(body: any, client: Socket) {
    client.emit('test', { content: 'dsadas' });
  }
}
