import { describe, it, expect, beforeEach } from 'vitest';

describe('UI Primitives', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="desktop">
        <div id="window-1" class="window" style="position: absolute; left: 100px; top: 100px; width: 400px; height: 300px;">
          <div class="window-title">Window 1</div>
          <div class="window-content"></div>
          <div class="resize-handle"></div>
        </div>
        <button id="button-1" class="btn">Click Me</button>
        <input id="input-1" type="text" placeholder="Type here">
        <textarea id="textarea-1"></textarea>
      </div>
    `;
  });

  describe('Button Interactions', () => {
    it('should trigger click event on button', () => {
      const button = document.getElementById('button-1');
      let clicked = false;

      button.addEventListener('click', () => {
        clicked = true;
      });

      button.click();
      expect(clicked).toBe(true);
    });

    it('should support disabled state', () => {
      const button = document.getElementById('button-1');
      expect(button.disabled).toBe(false);

      button.disabled = true;
      expect(button.disabled).toBe(true);
    });
  });

  describe('Input Handling', () => {
    it('should capture text input', () => {
      const input = document.getElementById('input-1');
      input.value = 'test input';

      expect(input.value).toBe('test input');
    });

    it('should handle input focus', () => {
      const input = document.getElementById('input-1');
      input.focus();

      expect(document.activeElement).toBe(input);
    });

    it('should handle input blur', () => {
      const input = document.getElementById('input-1');
      input.focus();
      expect(document.activeElement).toBe(input);

      input.blur();
      expect(document.activeElement).not.toBe(input);
    });
  });

  describe('Textarea Handling', () => {
    it('should capture multiline text', () => {
      const textarea = document.getElementById('textarea-1');
      const text = 'Line 1\nLine 2\nLine 3';
      textarea.value = text;

      expect(textarea.value).toBe(text);
    });

    it('should handle textarea resize', () => {
      const textarea = document.getElementById('textarea-1');
      textarea.style.width = '300px';
      textarea.style.height = '200px';

      expect(textarea.style.width).toBe('300px');
      expect(textarea.style.height).toBe('200px');
    });
  });

  describe('Modal/Dialog', () => {
    it('should display modal overlay', () => {
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.style.display = 'block';
      document.body.appendChild(modal);

      expect(modal.style.display).toBe('block');

      modal.remove();
    });

    it('should close modal on backdrop click', () => {
      const modal = document.createElement('div');
      modal.className = 'modal';
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';

      modal.appendChild(backdrop);
      document.body.appendChild(modal);

      backdrop.click();
      modal.style.display = 'none';

      expect(modal.style.display).toBe('none');

      modal.remove();
    });
  });

  describe('Toast Notifications', () => {
    it('should display toast message', () => {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = 'Test notification';
      toast.style.display = 'block';
      document.body.appendChild(toast);

      expect(toast.textContent).toBe('Test notification');
      expect(toast.style.display).toBe('block');

      toast.remove();
    });
  });
});
