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








// Invisible Walls for Murder Mystery Level 4
// These walls define the playable boundaries on the darkcave.png background

class InvisibleWall {
  constructor(x, y, width, height, debug = false) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.debug = debug; // Set to true to visualize walls
  }

  // Check if a point (like player position) collides with this wall
  collidesWith(pointX, pointY, radius = 0) {
    return (
      pointX + radius > this.x &&
      pointX - radius < this.x + this.width &&
      pointY + radius > this.y &&
      pointY - radius < this.y + this.height
    );
  }

  // Get closest point on wall to a given position (for sliding collision)
  getClosestPoint(x, y) {
    const closestX = Math.max(this.x, Math.min(x, this.x + this.width));
    const closestY = Math.max(this.y, Math.min(y, this.y + this.height));
    return { x: closestX, y: closestY };
  }

  // Draw wall for debugging
  draw(ctx) {
    if (!this.debug) return;
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
}

class WallManager {
  constructor(canvasWidth = 1000, canvasHeight = 600, debug = false) {
    this.walls = [];
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.debug = debug;
    this.initializeWalls();
  }

  initializeWalls() {
    // Define invisible walls for the dark cave environment
    // These create boundaries and define the playable area

    // Left wall
    this.addWall(0, 0, 50, this.canvasHeight);

    // Right wall
    this.addWall(this.canvasWidth - 50, 0, 50, this.canvasHeight);

    // Top wall
    this.addWall(0, 0, this.canvasWidth, 50);

    // Bottom wall
    this.addWall(0, this.canvasHeight - 50, this.canvasWidth, 50);

    // Interior cave walls - create a more interesting layout
    // Left cave alcove - blocked passage
    this.addWall(50, 150, 150, 200);

    // Right cave alcove - blocked passage
    this.addWall(this.canvasWidth - 200, 150, 150, 200);

    // Center pillar/obstacle
    this.addWall(450, 250, 100, 100);

    // Upper left blocking wall
    this.addWall(100, 80, 300, 60);

    // Lower right blocking wall
    this.addWall(600, 480, 300, 50);
  }

  addWall(x, y, width, height) {
    this.walls.push(new InvisibleWall(x, y, width, height, this.debug));
  }

  // Check if position is blocked by any wall
  isBlocked(x, y, radius = 0) {
    return this.walls.some(wall => wall.collidesWith(x, y, radius));
  }

  // Get all walls that collide with a position
  getCollidingWalls(x, y, radius = 0) {
    return this.walls.filter(wall => wall.collidesWith(x, y, radius));
  }

  // Prevent movement through walls (sliding collision)
  resolveCollision(newX, newY, oldX, oldY, radius = 0) {
    let resolvedX = newX;
    let resolvedY = newY;

    const collidingWalls = this.getCollidingWalls(newX, newY, radius);

    if (collidingWalls.length > 0) {
      // Try to slide along walls
      // First, try moving only in X
      if (!this.isBlocked(newX, oldY, radius)) {
        resolvedX = newX;
        resolvedY = oldY;
      }
      // Then try moving only in Y
      else if (!this.isBlocked(oldX, newY, radius)) {
        resolvedX = oldX;
        resolvedY = newY;
      }
      // If both blocked, stay in place
      else {
        resolvedX = oldX;
        resolvedY = oldY;
      }
    }

    return { x: resolvedX, y: resolvedY };
  }

  // Draw all walls (for debugging)
  draw(ctx) {
    this.walls.forEach(wall => wall.draw(ctx));
  }

  // Toggle debug visualization
  toggleDebug() {
    this.debug = !this.debug;
    this.walls.forEach(wall => {
      wall.debug = this.debug;
    });
  }
}

// Export for use in game
export { InvisibleWall, WallManager };
