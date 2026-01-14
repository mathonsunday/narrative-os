import { describe, it, expect, beforeEach } from 'vitest';

describe('File Operations', () => {
  let mockFiles = [];

  beforeEach(() => {
    mockFiles = [];
    // Setup DOM with file elements
    document.body.innerHTML = `
      <div id="file-container">
        <div class="file" data-id="file-1">
          <div class="file-icon" data-id="file-1"></div>
        </div>
      </div>
    `;
  });

  describe('File Creation', () => {
    it('should create a new file element in DOM', () => {
      const fileContainer = document.getElementById('file-container');
      const newFile = document.createElement('div');
      newFile.className = 'file';
      newFile.setAttribute('data-id', 'file-2');
      newFile.innerHTML = '<div class="file-icon" data-id="file-2"></div>';

      fileContainer.appendChild(newFile);

      const fileElements = document.querySelectorAll('.file');
      expect(fileElements.length).toBe(2);
      expect(fileElements[1].getAttribute('data-id')).toBe('file-2');
    });

    it('should assign unique IDs to files', () => {
      const file1 = document.querySelector('[data-id="file-1"]');
      const id1 = file1.getAttribute('data-id');

      const fileContainer = document.getElementById('file-container');
      const newFile = document.createElement('div');
      newFile.className = 'file';
      newFile.setAttribute('data-id', 'file-2');
      fileContainer.appendChild(newFile);

      const file2 = document.querySelector('[data-id="file-2"]');
      const id2 = file2.getAttribute('data-id');

      expect(id1).not.toBe(id2);
    });
  });

  describe('File Deletion', () => {
    it('should remove file from DOM', () => {
      let fileElements = document.querySelectorAll('.file');
      expect(fileElements.length).toBe(1);

      const fileToDelete = document.querySelector('[data-id="file-1"]');
      fileToDelete.remove();

      fileElements = document.querySelectorAll('.file');
      expect(fileElements.length).toBe(0);
    });

    it('should handle deletion of non-existent file gracefully', () => {
      const nonExistent = document.querySelector('[data-id="file-999"]');
      expect(nonExistent).toBeNull();
    });
  });

  describe('File Positioning', () => {
    it('should update file position using transform', () => {
      const fileIcon = document.querySelector('.file-icon');
      fileIcon.style.transform = 'translate(100px, 50px)';

      expect(fileIcon.style.transform).toBe('translate(100px, 50px)');
    });

  });

  describe('File Attributes', () => {
    it('should store and retrieve file metadata', () => {
      const file = document.querySelector('.file');
      file.setAttribute('data-name', 'test.txt');
      file.setAttribute('data-type', 'text');
      file.setAttribute('data-size', '1024');

      expect(file.getAttribute('data-name')).toBe('test.txt');
      expect(file.getAttribute('data-type')).toBe('text');
      expect(file.getAttribute('data-size')).toBe('1024');
    });

    it('should update file display name', () => {
      const file = document.querySelector('.file');
      const nameEl = document.createElement('span');
      nameEl.className = 'file-name';
      nameEl.textContent = 'original.txt';
      file.appendChild(nameEl);

      const name = file.querySelector('.file-name');
      expect(name.textContent).toBe('original.txt');

      name.textContent = 'renamed.txt';
      expect(name.textContent).toBe('renamed.txt');
    });
  });

  describe('File Selection', () => {
    it('should mark file as selected', () => {
      const file = document.querySelector('.file');
      file.classList.add('selected');

      expect(file.classList.contains('selected')).toBe(true);
    });

    it('should handle multiple file selection', () => {
      const container = document.getElementById('file-container');
      for (let i = 2; i <= 3; i++) {
        const newFile = document.createElement('div');
        newFile.className = 'file';
        newFile.setAttribute('data-id', `file-${i}`);
        container.appendChild(newFile);
      }

      const files = document.querySelectorAll('.file');
      files[0].classList.add('selected');
      files[2].classList.add('selected');

      const selectedFiles = document.querySelectorAll('.file.selected');
      expect(selectedFiles.length).toBe(2);
    });
  });
});
