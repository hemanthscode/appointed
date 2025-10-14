import { io } from 'socket.io-client';

class SocketService {
  socket = null;

  initialize(token) {
    if (this.socket) return;
    this.socket = io(import.meta.env.VITE_SOCKET_SERVER_URL || '', {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket'],
      autoConnect: false,
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    this.socket.open();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, payload) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, payload);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.removeAllListeners(event);
      }
    }
  }
}

const socketService = new SocketService();
export default socketService;
