import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { Notification } from '../entities/notification.entity';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket): Promise<void> {
    const token =
      (client.handshake.auth?.token as string) ||
      (client.handshake.headers?.authorization?.replace('Bearer ', '') ?? '');

    if (!token) {
      this.logger.warn(`WS disconnect – no token (socket ${client.id})`);
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify<{ sub: string }>(token);
      const userId = payload.sub;
      await client.join(`user:${userId}`);
      client.data.userId = userId;
      this.logger.log(`WS connected: user=${userId} socket=${client.id}`);
    } catch {
      this.logger.warn(`WS disconnect – invalid token (socket ${client.id})`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`WS disconnected: socket=${client.id}`);
  }

  notifyUser(userId: string, notification: Notification): void {
    this.server.to(`user:${userId}`).emit('new_notification', notification);
  }
}
