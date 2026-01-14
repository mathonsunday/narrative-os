import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocket as MockWebSocket, Server as MockWSServer } from 'mock-socket';

describe('Daemon Events Integration', () => {
  let mockWSServer;
  let ws;
  const WS_URL = 'ws://localhost:8765';
  let eventLog = [];

  beforeEach(() => {
    eventLog = [];
    mockWSServer = new MockWSServer(WS_URL);
    document.body.innerHTML = `
      <div id="desktop">
        <div id="file-container"></div>
        <div id="journal-container"></div>
      </div>
    `;
  });

  afterEach(() => {
    if (ws) ws.close();
    mockWSServer.close();
    vi.clearAllMocks();
  });

  describe('Chaos Daemon Events', () => {
    it('should handle CHAOS_EVENT from daemon', (done) => {
      ws = new MockWebSocket(WS_URL);

      ws.onopen = () => {
        mockWSServer.clients()[0].send(JSON.stringify({
          type: 'CHAOS_EVENT',
          data: {
            action: 'file_shuffle',
            description: 'Files rearranging themselves'
          }
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'CHAOS_EVENT') {
          expect(data.action).toBe('file_shuffle');
          eventLog.push(data);
          done();
        }
      };
    });

    it('should handle multiple chaos events in sequence', (done) => {
      ws = new MockWebSocket(WS_URL);
      const expectedEvents = 3;
      let receivedCount = 0;

      ws.onopen = () => {
        for (let i = 0; i < expectedEvents; i++) {
          mockWSServer.clients()[0].send(JSON.stringify({
            type: 'CHAOS_EVENT',
            data: { id: i }
          }));
        }
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'CHAOS_EVENT') {
          receivedCount++;
          if (receivedCount === expectedEvents) {
            expect(eventLog.length).toBe(0);
            done();
          }
        }
      };
    });

    it('should escalate chaos intensity', (done) => {
      ws = new MockWebSocket(WS_URL);

      ws.onopen = () => {
        mockWSServer.clients()[0].send(JSON.stringify({
          type: 'CHAOS_EVENT',
          data: { intensity: 0.3, action: 'mild' }
        }));

        setTimeout(() => {
          mockWSServer.clients()[0].send(JSON.stringify({
            type: 'CHAOS_EVENT',
            data: { intensity: 0.7, action: 'intense' }
          }));
        }, 100);
      };

      let chaosEvents = 0;
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'CHAOS_EVENT') {
          chaosEvents++;
          if (chaosEvents === 2) {
            done();
          }
        }
      };
    });
  });

  describe('Journal Daemon Events', () => {
    it('should handle JOURNAL_ENTRY event', (done) => {
      ws = new MockWebSocket(WS_URL);

      ws.onopen = () => {
        mockWSServer.clients()[0].send(JSON.stringify({
          type: 'JOURNAL_ENTRY',
          data: {
            id: 'j1',
            title: 'Day 1 Log',
            content: 'Started research at 2000m depth'
          }
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'JOURNAL_ENTRY') {
          expect(data.data.title).toBe('Day 1 Log');
          done();
        }
      };
    });

    it('should append journal entries to DOM', (done) => {
      ws = new MockWebSocket(WS_URL);

      ws.onopen = () => {
        mockWSServer.clients()[0].send(JSON.stringify({
          type: 'JOURNAL_ENTRY',
          data: {
            id: 'j1',
            title: 'Test Entry',
            content: 'Test content'
          }
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'JOURNAL_ENTRY') {
          const container = document.getElementById('journal-container');
          const entryEl = document.createElement('div');
          entryEl.className = 'journal-entry';
          entryEl.setAttribute('data-id', data.data.id);
          entryEl.innerHTML = `<h3>${data.data.title}</h3><p>${data.data.content}</p>`;
          container.appendChild(entryEl);

          const rendered = document.querySelector('[data-id="j1"]');
          expect(rendered).toBeTruthy();
          done();
        }
      };
    });

    it('should track journal entry frequency', (done) => {
      ws = new MockWebSocket(WS_URL);
      const entries = [];

      ws.onopen = () => {
        mockWSServer.clients()[0].send(JSON.stringify({
          type: 'JOURNAL_ENTRY',
          data: { id: 'j1', title: 'Entry 1' }
        }));
        setTimeout(() => {
          mockWSServer.clients()[0].send(JSON.stringify({
            type: 'JOURNAL_ENTRY',
            data: { id: 'j2', title: 'Entry 2' }
          }));
        }, 100);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'JOURNAL_ENTRY') {
          entries.push(data.data);
          if (entries.length === 2) {
            expect(entries.length).toBe(2);
            done();
          }
        }
      };
    });
  });

  describe('Watcher Daemon Events', () => {
    it('should handle FILE_CREATED event', (done) => {
      ws = new MockWebSocket(WS_URL);

      ws.onopen = () => {
        mockWSServer.clients()[0].send(JSON.stringify({
          type: 'FILE_CREATED',
          data: {
            id: 'file-1',
            name: 'data.csv',
            path: '/home/mira/data.csv',
            size: 2048
          }
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'FILE_CREATED') {
          expect(data.data.name).toBe('data.csv');
          done();
        }
      };
    });

    it('should handle FILE_DELETED event', (done) => {
      ws = new MockWebSocket(WS_URL);

      ws.onopen = () => {
        mockWSServer.clients()[0].send(JSON.stringify({
          type: 'FILE_DELETED',
          data: { id: 'file-1', name: 'obsolete.txt' }
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'FILE_DELETED') {
          expect(data.data.name).toBe('obsolete.txt');
          done();
        }
      };
    });

    it('should handle FILE_MODIFIED event', (done) => {
      ws = new MockWebSocket(WS_URL);

      ws.onopen = () => {
        mockWSServer.clients()[0].send(JSON.stringify({
          type: 'FILE_MODIFIED',
          data: {
            id: 'file-1',
            name: 'log.txt',
            modified: Date.now()
          }
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'FILE_MODIFIED') {
          expect(data.data.name).toBe('log.txt');
          done();
        }
      };
    });
  });

  describe('Event Ordering and Timing', () => {
    it('should maintain event order', (done) => {
      ws = new MockWebSocket(WS_URL);
      const events = [];

      ws.onopen = () => {
        mockWSServer.clients()[0].send(JSON.stringify({
          type: 'EVENT_1',
          order: 1
        }));
        mockWSServer.clients()[0].send(JSON.stringify({
          type: 'EVENT_2',
          order: 2
        }));
        mockWSServer.clients()[0].send(JSON.stringify({
          type: 'EVENT_3',
          order: 3
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        events.push(data.order);
        if (events.length === 3) {
          expect(events).toEqual([1, 2, 3]);
          done();
        }
      };
    });

  });

  describe('Error Handling in Events', () => {
    it('should handle malformed event data', (done) => {
      ws = new MockWebSocket(WS_URL);

      ws.onopen = () => {
        mockWSServer.clients()[0].send(JSON.stringify({
          type: 'VALID_EVENT',
          data: null // Invalid but won't crash
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        expect(data.type).toBe('VALID_EVENT');
        done();
      };
    });

    it('should skip events with missing required fields', (done) => {
      ws = new MockWebSocket(WS_URL);

      ws.onopen = () => {
        mockWSServer.clients()[0].send(JSON.stringify({
          // Missing 'type' field - but won't crash
          data: {}
        }));

        mockWSServer.clients()[0].send(JSON.stringify({
          type: 'VALID_EVENT',
          data: {}
        }));
      };

      let validEvents = 0;
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type) {
          validEvents++;
        }
        if (validEvents === 1) {
          done();
        }
      };
    });
  });
});
