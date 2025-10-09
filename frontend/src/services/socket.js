import { io } from 'socket.io-client';
import appConfig from '../config/appConfig';

class SocketService {
  constructor() {
    this.socket = null;
  }

  initialize(token) {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.socket = io(appConfig.apiBaseUrl, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: false,
    });

    this._setupListeners();

    this.socket.connect();
  }

  _setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    // Additional socket event listeners can be added here
  }

  emit(eventName, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(eventName, data);
    }
  }

  on(eventName, callback) {
    if (this.socket) {
      this.socket.on(eventName, callback);
    }
  }

  off(eventName, callback) {
    if (this.socket) {
      this.socket.off(eventName, callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }
}

const socketService = new SocketService();

export default socketService;
