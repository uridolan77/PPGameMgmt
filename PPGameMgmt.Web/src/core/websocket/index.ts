/**
 * WebSocket Service
 * 
 * Provides real-time communication capabilities for the application.
 * This service handles connection, reconnection, and message routing.
 */
import { config } from '../config';
import { logger } from '../logger';

export type WebSocketEventType = 'game.updated' | 'game.created' | 'player.updated' | 'notification' | 'system';

export interface WebSocketMessage<T = any> {
  type: WebSocketEventType;
  data: T;
  timestamp?: string;
}

/**
 * WebSocket Service for handling real-time communication
 */
export class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private listeners: Record<string, Array<(data: any) => void>> = {};
  private url: string | null = null;
  private token: string | null = null;
  private isConnecting = false;
  private reconnectTimeoutId: number | null = null;

  /**
   * Connect to the WebSocket server
   * 
   * @param url The WebSocket server URL
   * @param token Authentication token for the connection
   * @returns A promise that resolves when the connection is established
   */
  connect(url: string, token: string): Promise<void> {
    // Store parameters for reconnection
    this.url = url;
    this.token = token;
    
    // Prevent multiple connection attempts
    if (this.isConnecting) {
      return Promise.reject(new Error('WebSocket connection already in progress'));
    }
    
    this.isConnecting = true;
    
    return new Promise<void>((resolve, reject) => {
      try {
        // Build the WebSocket URL with the token
        const wsUrl = `${url}${url.includes('?') ? '&' : '?'}token=${token}`;
        
        // Create a new WebSocket
        this.socket = new WebSocket(wsUrl);
        
        // Connection opened handler
        this.socket.onopen = () => {
          logger.info('WebSocket connected');
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          
          // Notify listeners that we're connected
          this.notifyListeners('system', { status: 'connected' });
          
          resolve();
        };
        
        // Message handler
        this.socket.onmessage = (event) => {
          try {
            // Parse the incoming message
            const message: WebSocketMessage = JSON.parse(event.data);
            logger.debug('WebSocket message received:', message);
            
            // Notify listeners of the message
            this.notifyListeners(message.type, message.data);
          } catch (error) {
            logger.error('Error parsing WebSocket message', error);
            this.notifyListeners('system', { 
              status: 'error', 
              message: 'Failed to parse message',
              error
            });
          }
        };
        
        // Connection closed handler
        this.socket.onclose = (event) => {
          this.isConnecting = false;
          
          logger.warn(`WebSocket closed: ${event.code} ${event.reason}`);
          
          this.notifyListeners('system', { 
            status: 'disconnected',
            code: event.code,
            reason: event.reason
          });
          
          // Attempt to reconnect if not a clean close
          if (event.code !== 1000) {
            this.attemptReconnect();
          }
        };
        
        // Error handler
        this.socket.onerror = (error) => {
          logger.error('WebSocket error:', error);
          this.isConnecting = false;
          
          this.notifyListeners('system', { 
            status: 'error',
            error 
          });
          
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Attempt to reconnect to the WebSocket server
   */
  private attemptReconnect() {
    // Don't attempt to reconnect if we've reached the limit
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.warn(`WebSocket max reconnect attempts (${this.maxReconnectAttempts}) reached`);
      return;
    }
    
    // Don't schedule multiple reconnect attempts
    if (this.reconnectTimeoutId !== null) {
      return;
    }
    
    // Calculate exponential backoff with jitter
    const delay = this.getReconnectDelay();
    this.reconnectAttempts++;
    
    logger.info(`WebSocket reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.notifyListeners('system', { 
      status: 'reconnecting',
      attempt: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
      delay
    });
    
    // Schedule reconnection
    this.reconnectTimeoutId = window.setTimeout(() => {
      this.reconnectTimeoutId = null;
      
      // Reconnect if we have the URL and token
      if (this.url && this.token) {
        this.connect(this.url, this.token).catch((error) => {
          logger.error('WebSocket reconnect failed:', error);
        });
      }
    }, delay);
  }

  /**
   * Calculate reconnect delay with exponential backoff and jitter
   */
  private getReconnectDelay(): number {
    // Base delay with exponential backoff
    const exponentialDelay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts);
    
    // Add jitter (±20%)
    const jitter = exponentialDelay * 0.2 * (Math.random() * 2 - 1);
    
    // Cap at 30 seconds
    return Math.min(exponentialDelay + jitter, 30000);
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    // Clear any reconnect attempts
    if (this.reconnectTimeoutId !== null) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
    
    // Close the socket if it exists
    if (this.socket) {
      // Only close if it's open
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.close(1000, 'Client disconnected');
      }
      
      this.socket = null;
    }
    
    // Reset connection state
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    
    logger.info('WebSocket disconnected');
  }

  /**
   * Check if the WebSocket is connected
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Send a message to the WebSocket server
   * 
   * @param type The message type
   * @param data The message data
   * @returns A promise that resolves when the message is sent
   */
  send<T = any>(type: WebSocketEventType, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        reject(new Error('WebSocket not connected'));
        return;
      }
      
      try {
        const message: WebSocketMessage<T> = {
          type,
          data,
          timestamp: new Date().toISOString()
        };
        
        this.socket?.send(JSON.stringify(message));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Subscribe to WebSocket events
   * 
   * @param eventType The event type to subscribe to
   * @param callback The callback to call when the event occurs
   * @returns A function to unsubscribe
   */
  subscribe<T = any>(eventType: WebSocketEventType | 'system', callback: (data: T) => void): () => void {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    
    this.listeners[eventType].push(callback as any);
    
    // Return unsubscribe function
    return () => {
      this.listeners[eventType] = this.listeners[eventType].filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all listeners of an event
   * 
   * @param eventType The event type
   * @param data The event data
   */
  private notifyListeners(eventType: string, data: any) {
    if (this.listeners[eventType]) {
      this.listeners[eventType].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          logger.error(`Error in WebSocket listener for ${eventType}:`, error);
        }
      });
    }
    
    // Also notify wildcard listeners
    if (eventType !== '*' && this.listeners['*']) {
      this.listeners['*'].forEach(callback => {
        try {
          callback({ type: eventType, data });
        } catch (error) {
          logger.error(`Error in WebSocket wildcard listener:`, error);
        }
      });
    }
  }
}

// Create and export a singleton instance
export const webSocketService = new WebSocketService();

/**
 * React hook for using WebSocket subscriptions in components
 */
import { useEffect, useState } from 'react';

export function useWebSocketEvent<T = any>(
  eventType: WebSocketEventType | 'system',
  initialState?: T
): [T | undefined, boolean] {
  const [data, setData] = useState<T | undefined>(initialState);
  const [isConnected, setIsConnected] = useState<boolean>(webSocketService.isConnected());
  
  useEffect(() => {
    // Listen for the specific event
    const unsubscribe = webSocketService.subscribe<T>(eventType, (newData) => {
      setData(newData);
    });
    
    // Listen for connection status changes
    const unsubscribeSystem = webSocketService.subscribe('system', (systemData: any) => {
      if ('status' in systemData) {
        setIsConnected(systemData.status === 'connected');
      }
    });
    
    // Initial connection status
    setIsConnected(webSocketService.isConnected());
    
    // Cleanup
    return () => {
      unsubscribe();
      unsubscribeSystem();
    };
  }, [eventType]);
  
  return [data, isConnected];
}