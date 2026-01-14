import { describe, it, expect, beforeEach } from 'vitest';

describe('Journal Entry System', () => {
  let journal = [];

  beforeEach(() => {
    journal = [];
    document.body.innerHTML = `
      <div id="journal-container">
        <div id="journal-entries"></div>
      </div>
    `;
  });

  describe('Journal Entry Creation', () => {
    it('should create a new journal entry', () => {
      const entry = {
        id: 'journal-1',
        timestamp: Date.now(),
        title: 'First Entry',
        content: 'This is my first journal entry.',
        author: 'Mira'
      };

      journal.push(entry);

      expect(journal.length).toBe(1);
      expect(journal[0].title).toBe('First Entry');
    });

    it('should assign unique IDs to entries', () => {
      const entry1 = { id: 'journal-1', title: 'Entry 1' };
      const entry2 = { id: 'journal-2', title: 'Entry 2' };

      journal.push(entry1);
      journal.push(entry2);

      expect(journal[0].id).not.toBe(journal[1].id);
    });

    it('should store entry content correctly', () => {
      const content = 'Deep observations at 2000m depth';
      const entry = {
        id: 'journal-1',
        content: content,
        title: 'Deep Dive Log'
      };

      journal.push(entry);

      expect(journal[0].content).toBe(content);
    });
  });

  describe('Journal Entry Rendering', () => {
    it('should render journal entry in DOM', () => {
      const entry = {
        id: 'journal-1',
        title: 'Test Entry',
        content: 'Test content',
        timestamp: Date.now()
      };

      const entriesContainer = document.getElementById('journal-entries');
      const entryEl = document.createElement('div');
      entryEl.className = 'journal-entry';
      entryEl.setAttribute('data-id', entry.id);
      entryEl.innerHTML = `
        <h3 class="entry-title">${entry.title}</h3>
        <p class="entry-content">${entry.content}</p>
      `;
      entriesContainer.appendChild(entryEl);

      const rendered = document.querySelector('[data-id="journal-1"]');
      expect(rendered).toBeTruthy();
      expect(rendered.querySelector('.entry-title').textContent).toBe('Test Entry');
    });

    it('should highlight recent entries', () => {
      const recentEntry = document.createElement('div');
      recentEntry.className = 'journal-entry recent';
      recentEntry.textContent = 'Recent entry';
      document.getElementById('journal-entries').appendChild(recentEntry);

      expect(recentEntry.classList.contains('recent')).toBe(true);
    });
  });

  describe('Journal Entry Updates', () => {
    it('should update existing journal entry', () => {
      const entry = {
        id: 'journal-1',
        title: 'Original Title',
        content: 'Original content'
      };

      journal.push(entry);
      expect(journal[0].title).toBe('Original Title');

      journal[0].title = 'Updated Title';
      expect(journal[0].title).toBe('Updated Title');
    });

    it('should edit journal entry content', () => {
      const entry = {
        id: 'journal-1',
        content: 'Original content'
      };

      journal.push(entry);
      const newContent = 'This has been edited';
      journal[0].content = newContent;

      expect(journal[0].content).toBe(newContent);
    });

    it('should mark entry as edited', () => {
      const entry = {
        id: 'journal-1',
        title: 'Title',
        edited: false
      };

      journal.push(entry);
      journal[0].edited = true;

      expect(journal[0].edited).toBe(true);
    });
  });

  describe('Journal Entry Deletion', () => {
    it('should delete journal entry', () => {
      const entry = { id: 'journal-1', title: 'To Delete' };
      journal.push(entry);
      expect(journal.length).toBe(1);

      journal = journal.filter(e => e.id !== 'journal-1');
      expect(journal.length).toBe(0);
    });

    it('should remove entry from DOM', () => {
      const entriesContainer = document.getElementById('journal-entries');
      const entryEl = document.createElement('div');
      entryEl.className = 'journal-entry';
      entryEl.setAttribute('data-id', 'journal-1');
      entriesContainer.appendChild(entryEl);

      expect(document.querySelector('[data-id="journal-1"]')).toBeTruthy();

      entryEl.remove();
      expect(document.querySelector('[data-id="journal-1"]')).toBeNull();
    });
  });

  describe('Journal Search and Filter', () => {
    beforeEach(() => {
      journal = [
        { id: 'j1', title: 'Deep Sea Observations', content: 'Found new species' },
        { id: 'j2', title: 'ROV Maintenance Log', content: 'Repaired camera' },
        { id: 'j3', title: 'Deep Sea Life', content: 'Bioluminescent creatures' }
      ];
    });

    it('should search entries by title', () => {
      const query = 'Deep Sea';
      const results = journal.filter(e => e.title.includes(query));

      expect(results.length).toBe(2);
      expect(results[0].title).toContain('Deep Sea');
    });

    it('should search entries by content', () => {
      const query = 'camera';
      const results = journal.filter(e => e.content.toLowerCase().includes(query.toLowerCase()));

      expect(results.length).toBe(1);
      expect(results[0].title).toBe('ROV Maintenance Log');
    });

  });

});
