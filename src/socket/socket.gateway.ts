import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { SocketService } from './socket.service';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class SocketGateway {
  constructor(private readonly socketService: SocketService) {}

  @SubscribeMessage('test')
  handleMessage(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
    console.log(body);
    this.socketService.emitMessage(body, client);
  }
}
