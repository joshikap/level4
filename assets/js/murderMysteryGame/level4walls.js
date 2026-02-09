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
