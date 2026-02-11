import Player from '../MansionLogic/Player.js';
import Projectile from './Projectile.js';

class FightingPlayer extends Player {
    // Construct the class, with a list of stored projectiles
    constructor(data = null, gameEnv = null) {
        super(data, gameEnv);
        this.projectiles = [];
        this.lastAttackTime = Date.now();
        this.attackCooldown = 500; // 500ms between shots
        this.currentDirection = 'right'; // track facing direction

        // Bind attack to spacebar
        if (typeof window !== 'undefined') {
            this._attackHandler = (event) => {
                if (event.code === 'Space' || event.key === ' ') {
                    this.attack();
                }
            };
            window.addEventListener('keydown', this._attackHandler);
        }
    }

    // Update spook and the projectiles
    update(...args) {
        super.update(...args);  // Do normal player updating
        
        // Track facing direction based on movement
        if (this.velocity.x > 0) this.currentDirection = 'right';
        else if (this.velocity.x < 0) this.currentDirection = 'left';
        
        // Update and clean up projectiles
        this.projectiles = this.projectiles.filter(p => !p.revComplete);
        this.projectiles.forEach(p => p.update());
    }

    // Execute an attack
    attack() {
        const now = Date.now();
        if (now - this.lastAttackTime < this.attackCooldown) return;
        
        // Find the boss
        const boss = this.gameEnv.gameObjects.find(obj => 
            obj.constructor.name === 'Boss'
        );
        
        if (!boss) return; // No boss to attack
        
        // Calculate distance to boss
        const dx = boss.position.x - this.position.x;
        const dy = boss.position.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const MELEE_RANGE = 100; // Distance threshold for melee
        const RANGED_DAMAGE = 10;
        const MELEE_DAMAGE = 15; // 1.5x ranged damage (10 * 1.5)
        
        if (distance < MELEE_RANGE) {
            // MELEE ATTACK - deal direct damage to boss
            boss.healthPoints -= MELEE_DAMAGE;
            console.log(`⚔️ MELEE HIT! Damage: ${MELEE_DAMAGE}, Boss HP: ${boss.healthPoints}/${boss.fullHealth}`);
            
            // Visual melee effect
            this.showMeleeEffect();
        } else {
            // RANGED ATTACK - shoot arrow projectile
            const facingRight = this.currentDirection === 'right';
            const targetX = this.position.x + (facingRight ? 500 : -500);
            const targetY = this.position.y;
            
            // Create arrow projectile
            this.projectiles.push(
                new Projectile(
                    this.gameEnv,
                    targetX, 
                    targetY,
                    this.position.x + this.width/2,
                    this.position.y + this.height/2,
                    "PLAYER",  // Special type for player projectiles
                    RANGED_DAMAGE // Pass damage value
                )
            );
            
            console.log(`🏹 RANGED ATTACK! Arrow fired.`);
        }
        
        this.lastAttackTime = now;
    }

    // Visual effect for melee attack
    showMeleeEffect() {
        // Create a quick slash effect near the player
        const effect = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2,
            lifetime: 0,
            maxLifetime: 15, // 15 frames
            gameEnv: this.gameEnv,
            
            update: function() {
                this.lifetime++;
                if (this.lifetime >= this.maxLifetime) {
                    const index = this.gameEnv.gameObjects.indexOf(this);
                    if (index > -1) {
                        this.gameEnv.gameObjects.splice(index, 1);
                    }
                }
                this.draw();
            },
            
            draw: function() {
                const ctx = this.gameEnv.ctx;
                if (!ctx) return;
                
                ctx.save();
                ctx.strokeStyle = '#ffff00';
                ctx.lineWidth = 5;
                ctx.shadowColor = '#ffff00';
                ctx.shadowBlur = 15;
                
                const size = 50;
                const angle = Math.PI / 4; // 45 degree slash
                
                ctx.beginPath();
                ctx.moveTo(
                    this.x - Math.cos(angle) * size, 
                    this.y - Math.sin(angle) * size
                );
                ctx.lineTo(
                    this.x + Math.cos(angle) * size, 
                    this.y + Math.sin(angle) * size
                );
                ctx.stroke();
                
                ctx.restore();
            },
            
            resize: function() {
                // No resize needed
            }
        };
        
        this.gameEnv.gameObjects.push(effect);
    }

    // Clean up event listeners when destroyed
    destroy() {
        if (typeof window !== 'undefined' && this._attackHandler) {
            window.removeEventListener('keydown', this._attackHandler);
        }
        super.destroy();
    }
}

export default FightingPlayer;