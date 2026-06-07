import { io, Socket } from 'socket.io-client';

const WS_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:3000';

type EventCallback = (data: unknown) => void;

class SocketService {
  private socket: Socket | null = null;

  connect(): void {
    if (this.socket?.connected) return;

    const token = localStorage.getItem('token') ?? '';
    this.socket = io(`${WS_BASE}/notifications`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected to /notifications');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  on(event: string, cb: EventCallback): void {
    this.socket?.on(event, cb as (...args: unknown[]) => void);
  }

  off(event: string, cb?: EventCallback): void {
    if (cb) {
      this.socket?.off(event, cb as (...args: unknown[]) => void);
    } else {
      this.socket?.off(event);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export default new SocketService();
