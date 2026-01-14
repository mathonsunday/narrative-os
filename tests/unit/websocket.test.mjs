import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocket as MockWebSocket, Server as MockWSServer } from 'mock-socket';

describe('WebSocket Connection', () => {
  let mockWSServer;
  const WS_URL = 'ws://localhost:8765';

  beforeEach(() => {
    // Create mock WebSocket server
    mockWSServer = new MockWSServer(WS_URL);
  });

  afterEach(() => {
    mockWSServer.close();
    vi.clearAllMocks();
  });

  it('should establish connection to backend', (done) => {
    const ws = new MockWebSocket(WS_URL);

    ws.onopen = () => {
      expect(ws.readyState).toBe(WebSocket.OPEN);
      done();
    };
  });

  it('should receive and parse backend events', (done) => {
    const ws = new MockWebSocket(WS_URL);
    const testEvent = { type: 'FILE_CREATED', data: { id: 'file-1', name: 'test.txt' } };

    ws.onopen = () => {
      mockWSServer.clients()[0].send(JSON.stringify(testEvent));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      expect(data).toEqual(testEvent);
      expect(data.type).toBe('FILE_CREATED');
      done();
    };
  });

  it('should handle connection errors gracefully', () => {
    return new Promise((resolve) => {
      const ws = new MockWebSocket(WS_URL);

      ws.onopen = () => {
        ws.close();
      };

      ws.onclose = () => {
        expect(ws.readyState).toBe(WebSocket.CLOSED);
        resolve();
      };
    });
  });


  it('should handle malformed JSON gracefully', () => {
    return new Promise((resolve) => {
      const ws = new MockWebSocket(WS_URL);
      let messageReceived = false;

      ws.onopen = () => {
        mockWSServer.clients()[0].send('{ invalid json }');
      };

      ws.onmessage = (event) => {
        messageReceived = true;
        try {
          JSON.parse(event.data);
        } catch (e) {
          // Expected - malformed JSON causes error
        }
      };

      // Give mock time to process, then check connection is still open
      setTimeout(() => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
        resolve();
      }, 10);
    });
  });
});
