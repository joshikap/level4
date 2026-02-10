// Murder Mystery Level 4 V1
import GameControl from '../GameEngine/essentials/GameControl.js';
import GameEnvBackground from '../GameEngine/essentials/GameEnvBackground.js';

// Flashlight effect game object
class FlashlightEffect {
  constructor(data, gameEnv) {
    this.gameEnv = gameEnv;
    this.x = gameEnv.innerWidth / 2;
    this.y = gameEnv.innerHeight / 2;
    this.radius = 150;
    this.opacity = 0.7;
    this.handleMouseMove = null;
    
    // Track mouse movement
    this.setupMouseTracking();
  }

  setupMouseTracking() {
    const canvas = this.gameEnv.canvas;
    if (!canvas) return;
    
    this.handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      this.x = e.clientX - rect.left;
      this.y = e.clientY - rect.top;
    };
    
    canvas.addEventListener('mousemove', this.handleMouseMove);
  }

  update() {
    const ctx = this.gameEnv.ctx;
    if (!ctx) return;

    const canvas = this.gameEnv.canvas;
    
    // Draw black overlay with transparency
    ctx.fillStyle = `rgba(0, 0, 0, ${this.opacity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create radial gradient for flashlight effect
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.radius
    );
    
    // Gradient: transparent in center -> black at edges
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Optional: draw a subtle circle outline to highlight flashlight beam
    ctx.strokeStyle = 'rgba(255, 255, 150, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  resize() {
    // Handle canvas resize
  }

  destroy() {
    // Cleanup event listeners
    if (this.handleMouseMove && this.gameEnv.canvas) {
      this.gameEnv.canvas.removeEventListener('mousemove', this.handleMouseMove);
    }
  }
}

// Custom level for murder mystery flashlight game
class MurderMysteryFlashlightLevel {
  constructor(gameEnv) {
    const path = gameEnv.path;
    
    // Black background for dark atmosphere
    const bgData = {
      name: 'dark_background',
      src: path + "/images/gamebuilder/darkcave.png",
      pixels: { height: 600, width: 1000 }
    };
    
    const flashlightData = {
      id: 'flashlight'
    };
    
    this.classes = [
      { class: GameEnvBackground, data: bgData },
      { class: FlashlightEffect, data: flashlightData }
    ];
  }
}

// Export for GameRunner
export const gameLevelClasses = [MurderMysteryFlashlightLevel];
export { GameControl };