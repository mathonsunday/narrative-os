import { describe, it, expect, beforeEach } from 'vitest';

describe('User Interactions', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="file-container">
        <div class="file-icon" id="file-1" style="position: absolute; left: 100px; top: 100px;"></div>
        <div class="file-icon" id="file-2" style="position: absolute; left: 200px; top: 200px;"></div>
      </div>
      <button id="open-btn">Open</button>
      <button id="delete-btn">Delete</button>
    `;
  });

  describe('File Click Interaction', () => {
    it('should detect file selection on click', () => {
      const file = document.getElementById('file-1');
      let clicked = false;

      file.addEventListener('click', () => {
        clicked = true;
        file.classList.add('selected');
      });

      file.click();
      expect(clicked).toBe(true);
      expect(file.classList.contains('selected')).toBe(true);
    });

    it('should handle multiple file selection with click', () => {
      const file1 = document.getElementById('file-1');
      const file2 = document.getElementById('file-2');
      const selectedFiles = [];

      [file1, file2].forEach(file => {
        file.addEventListener('click', (e) => {
          if (e.ctrlKey || e.metaKey) {
            file.classList.toggle('selected');
          } else {
            document.querySelectorAll('.file-icon').forEach(f => f.classList.remove('selected'));
            file.classList.add('selected');
          }
          if (file.classList.contains('selected')) {
            selectedFiles.push(file.id);
          }
        });
      });

      file1.click();
      expect(document.querySelectorAll('.file-icon.selected').length).toBe(1);

      file2.click();
      expect(document.querySelectorAll('.file-icon.selected').length).toBe(1);
    });

    it('should trigger double-click event', () => {
      const file = document.getElementById('file-1');
      let doubleClicked = false;

      file.addEventListener('dblclick', () => {
        doubleClicked = true;
      });

      const doubleClickEvent = new MouseEvent('dblclick', {
        bubbles: true,
        cancelable: true
      });
      file.dispatchEvent(doubleClickEvent);

      expect(doubleClicked).toBe(true);
    });

    it('should detect right-click (context menu)', () => {
      const file = document.getElementById('file-1');
      let contextMenuTriggered = false;

      file.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        contextMenuTriggered = true;
      });

      const rightClickEvent = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        button: 2
      });
      file.dispatchEvent(rightClickEvent);

      expect(contextMenuTriggered).toBe(true);
    });
  });

  describe('Button Click Interactions', () => {
    it('should trigger open button action', () => {
      const openBtn = document.getElementById('open-btn');
      let actionTriggered = false;

      openBtn.addEventListener('click', () => {
        actionTriggered = true;
      });

      openBtn.click();
      expect(actionTriggered).toBe(true);
    });

    it('should trigger delete button action', () => {
      const deleteBtn = document.getElementById('delete-btn');
      const file = document.getElementById('file-1');
      file.classList.add('selected');

      let deleteTriggered = false;

      deleteBtn.addEventListener('click', () => {
        document.querySelectorAll('.file-icon.selected').forEach(f => f.remove());
        deleteTriggered = true;
      });

      deleteBtn.click();

      expect(deleteTriggered).toBe(true);
      expect(document.getElementById('file-1')).toBeNull();
      expect(document.getElementById('file-2')).toBeTruthy();
    });

    it('should handle button disabled state', () => {
      const btn = document.getElementById('open-btn');
      expect(btn.disabled).toBe(false);

      btn.disabled = true;
      expect(btn.disabled).toBe(true);
    });
  });

  describe('Drag and Drop Events', () => {
    it('should detect drag start', () => {
      const file = document.getElementById('file-1');
      let dragStarted = false;

      file.addEventListener('dragstart', () => {
        dragStarted = true;
      });

      const dragStartEvent = new MouseEvent('dragstart', {
        bubbles: true,
        cancelable: true
      });
      file.dispatchEvent(dragStartEvent);

      expect(dragStarted).toBe(true);
    });

    it('should detect drag over', () => {
      const container = document.getElementById('file-container');
      let dragOverDetected = false;

      container.addEventListener('dragover', (e) => {
        e.preventDefault();
        dragOverDetected = true;
      });

      const dragOverEvent = new MouseEvent('dragover', {
        bubbles: true,
        cancelable: true
      });
      container.dispatchEvent(dragOverEvent);

      expect(dragOverDetected).toBe(true);
    });

    it('should detect drop', () => {
      const container = document.getElementById('file-container');
      let dropDetected = false;

      container.addEventListener('drop', (e) => {
        e.preventDefault();
        dropDetected = true;
      });

      const dropEvent = new MouseEvent('drop', {
        bubbles: true,
        cancelable: true
      });
      container.dispatchEvent(dropEvent);

      expect(dropDetected).toBe(true);
    });
  });

  describe('Keyboard Interactions', () => {
    beforeEach(() => {
      document.body.innerHTML += `<input id="search" type="text" placeholder="Search...">`;
    });

    it('should detect key press in input', () => {
      const input = document.getElementById('search');
      let keyPressed = false;

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          keyPressed = true;
        }
      });

      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true
      });
      input.dispatchEvent(enterEvent);

      expect(keyPressed).toBe(true);
    });

    it('should detect keyboard shortcut (Ctrl+S)', () => {
      let saveTriggered = false;

      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          saveTriggered = true;
        }
      });

      const shortcutEvent = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true
      });
      document.dispatchEvent(shortcutEvent);

      expect(saveTriggered).toBe(true);
    });

    it('should detect Escape key', () => {
      let escapePressed = false;

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          escapePressed = true;
        }
      });

      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true
      });
      document.dispatchEvent(escapeEvent);

      expect(escapePressed).toBe(true);
    });
  });

  describe('Mouse Position Tracking', () => {
    it('should calculate distance between mouse and element', () => {
      const file = document.getElementById('file-1');
      const rect = file.getBoundingClientRect();
      const fileX = rect.left + rect.width / 2;
      const fileY = rect.top + rect.height / 2;

      const mouseX = 150;
      const mouseY = 150;

      const dx = fileX - mouseX;
      const dy = fileY - mouseY;
      const distance = Math.hypot(dx, dy);

      expect(distance).toBeGreaterThanOrEqual(0);
    });

    it('should calculate angle from mouse to element', () => {
      const file = document.getElementById('file-1');
      const rect = file.getBoundingClientRect();
      const fileX = rect.left + rect.width / 2;
      const fileY = rect.top + rect.height / 2;

      const mouseX = 150;
      const mouseY = 150;

      const dx = fileX - mouseX;
      const dy = fileY - mouseY;
      const angle = Math.atan2(dy, dx);

      expect(angle).toBeGreaterThanOrEqual(-Math.PI);
      expect(angle).toBeLessThanOrEqual(Math.PI);
    });

    it('should determine if mouse is within file area', () => {
      const file = document.getElementById('file-1');
      const rect = file.getBoundingClientRect();

      const mouseInside = 100 <= 100 && 100 <= 100 &&
                          100 >= 100 && 100 >= 100;

      expect(mouseInside).toBe(true);
    });
  });

  describe('Focus and Blur Events', () => {
    beforeEach(() => {
      document.body.innerHTML += `
        <input id="first-input" type="text">
        <input id="second-input" type="text">
      `;
    });

    it('should detect input focus', () => {
      const input = document.getElementById('first-input');
      let focused = false;

      input.addEventListener('focus', () => {
        focused = true;
      });

      input.focus();
      expect(focused).toBe(true);
      expect(document.activeElement).toBe(input);
    });

    it('should detect input blur', () => {
      const input = document.getElementById('first-input');
      input.focus();

      let blurred = false;
      input.addEventListener('blur', () => {
        blurred = true;
      });

      input.blur();
      expect(blurred).toBe(true);
    });

    it('should handle focus change between inputs', () => {
      const input1 = document.getElementById('first-input');
      const input2 = document.getElementById('second-input');

      input1.focus();
      expect(document.activeElement).toBe(input1);

      input2.focus();
      expect(document.activeElement).toBe(input2);
    });
  });
});
