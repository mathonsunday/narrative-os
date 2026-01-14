/**
 * Audio Engine Demo - Test the ambient sounds
 * 
 * This is just a demo page. The actual library is exported from index.ts
 */
import './style.css';
import { Ambience } from './ambience/ambience';
import { SoundEffect } from './ambience/sound-effects';

const ambience = new Ambience();
const sfx = new SoundEffect();

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <div style="max-width: 600px; margin: 0 auto; padding: 40px; font-family: system-ui;">
    <h1 style="color: #4dd0e1;">🌊 Audio Engine Demo</h1>
    <p style="color: #888; margin-bottom: 30px;">Test the ambient soundscapes and sound effects</p>
    
    <h2 style="color: #aaa; font-size: 14px; margin-top: 30px;">AMBIENT SOUNDSCAPES</h2>
    <div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 15px 0;">
      <button class="ambience-btn" data-preset="deepSea">Deep Sea</button>
      <button class="ambience-btn" data-preset="rov">ROV</button>
      <button class="ambience-btn" data-preset="sonar">Sonar</button>
      <button class="ambience-btn" data-preset="bioluminescence">Bioluminescence</button>
      <button class="ambience-btn" data-preset="hydrophone">Hydrophone</button>
      <button class="ambience-btn" data-preset="discovery">Discovery</button>
      <button class="ambience-btn" data-preset="lab">Lab</button>
      <button class="ambience-btn" data-preset="tension">Tension</button>
    </div>
    <button id="stop-btn" style="background: #ff5555; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-top: 10px;">Stop All</button>
    
    <h2 style="color: #aaa; font-size: 14px; margin-top: 40px;">SOUND EFFECTS</h2>
    <div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 15px 0;">
      <button class="sfx-btn" data-type="sonarPing">Sonar Ping</button>
      <button class="sfx-btn" data-type="notification">Notification</button>
      <button class="sfx-btn" data-type="success">Success</button>
      <button class="sfx-btn" data-type="error">Error</button>
      <button class="sfx-btn" data-type="warning">Warning</button>
      <button class="sfx-btn" data-type="discovery">Discovery</button>
      <button class="sfx-btn" data-type="creature">Creature</button>
      <button class="sfx-btn" data-type="click">Click</button>
      <button class="sfx-btn" data-type="open">Open</button>
      <button class="sfx-btn" data-type="close">Close</button>
    </div>
    
    <div style="margin-top: 50px; padding: 20px; background: #1a1a2e; border-radius: 8px; font-size: 13px; color: #888;">
      <strong style="color: #4dd0e1;">Usage in your project:</strong>
      <pre style="background: #0a0a12; padding: 15px; border-radius: 4px; overflow-x: auto; margin-top: 10px;">
import { Ambience, SoundEffect } from './audio-engine';

const ambience = new Ambience();
await ambience.play('deepSea', { intensity: 0.6 });

const sfx = new SoundEffect();
sfx.play('sonarPing');
      </pre>
    </div>
  </div>
`;

// Add styles for buttons
const style = document.createElement('style');
style.textContent = `
  .ambience-btn, .sfx-btn {
    background: #1a1a2e;
    color: #4dd0e1;
    border: 1px solid #4dd0e1;
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .ambience-btn:hover, .sfx-btn:hover {
    background: #4dd0e1;
    color: #0a0a12;
  }
  .ambience-btn.active {
    background: #4dd0e1;
    color: #0a0a12;
  }
`;
document.head.appendChild(style);

// Event listeners for ambience buttons
document.querySelectorAll('.ambience-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const preset = (btn as HTMLElement).dataset.preset;
    document.querySelectorAll('.ambience-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ambience.stop();
    await ambience.play(preset as any, { intensity: 0.6 });
  });
});

// Stop button
document.getElementById('stop-btn')?.addEventListener('click', () => {
  ambience.stop();
  document.querySelectorAll('.ambience-btn').forEach(b => b.classList.remove('active'));
});

// Event listeners for sound effect buttons
document.querySelectorAll('.sfx-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const type = (btn as HTMLElement).dataset.type;
    await sfx.play(type as any);
  });
});
