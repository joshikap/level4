import Character from '../MansionLogic/Character.js';
import showDeathScreen from './DeathScreen.js';
import { updatePlayerHealthBar } from "./HealthBars.js";

class ChargeAttack extends Character {
    constructor(gameEnv = null, boss, targetx, targety) {
        // Use minimal placeholder data; sprite will override it
        super({ id: 'charge' }, gameEnv);

        this.boss = boss; // Reference to the boss object
        this.target_coords = { x: targetx, y: targety };
        this.source_coords = { x: boss.position.x, y: boss.position.y };

        // Charge mechanics
        this.isCharging = true; // Charging up phase
        this.chargeTime = 0;
        this.chargeDelay = 500; // 0.5 seconds in milliseconds
        this.chargeStartTime = Date.now();

        // Movement during charge
        this.chargeSpeed = 8; // Speed when charging at player
        this.hasCharged = false;
        this.revComplete = false;

        // Calculate direction
        const dx = targetx - this.source_coords.x;
        const dy = targety - this.source_coords.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.direction = {
            x: dx / distance,
            y: dy / distance
        };

        this.position = { x: this.source_coords.x, y: this.source_coords.y };

        // Visual indicator during charge-up (optional - can be a glow effect)
        this.chargeGlowRadius = 0;
    }

    update() {
        if (this.revComplete) return;

        const currentTime = Date.now();

        // Phase 1: Charging up (0.5 seconds)
        if (this.isCharging) {
            this.chargeTime = currentTime - this.chargeStartTime;
            
            // Visual feedback - growing glow
            this.chargeGlowRadius = Math.min(60, (this.chargeTime / this.chargeDelay) * 60);
            
            // Move boss position to charging position during charge-up
            if (this.boss) {
                this.position.x = this.boss.position.x;
                this.position.y = this.boss.position.y;
            }

            // After 0.5 seconds, start the charge
            if (this.chargeTime >= this.chargeDelay) {
                this.isCharging = false;
                this.hasCharged = true;
                console.log("Boss is charging!");
            }

            this.draw();
            return;
        }

        // Phase 2: Charging at player
        if (this.hasCharged && !this.revComplete) {
            // Move boss in the direction
            if (this.boss) {
                this.boss.position.x += this.direction.x * this.chargeSpeed;
                this.boss.position.y += this.direction.y * this.chargeSpeed;
                
                this.position.x = this.boss.position.x;
                this.position.y = this.boss.position.y;
            }

            // Check if boss has traveled far enough or hit edge
            const distTraveled = Math.sqrt(
                Math.pow(this.position.x - this.source_coords.x, 2) +
                Math.pow(this.position.y - this.source_coords.y, 2)
            );

            // Stop after traveling ~300 pixels or hitting screen edge
            const canvas = this.gameEnv?.canvas;
            if (distTraveled > 300 || 
                (canvas && (this.position.x < 0 || this.position.x > canvas.width ||
                            this.position.y < 0 || this.position.y > canvas.height))) {
                this.revComplete = true;
                this.destroy();
                return;
            }

            // Check for collision with player
            this.execDamage();
        }

        this.draw();
    }

    draw() {
        const ctx = this.ctx;
        if (!ctx) return;

        this.clearCanvas();

        // During charge-up, draw a glowing indicator
        if (this.isCharging) {
            const size = Math.max(80, this.chargeGlowRadius * 2);
            this.canvas.width = size;
            this.canvas.height = size;

            ctx.save();
            
            // Draw pulsing red glow
            const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, this.chargeGlowRadius);
            gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.4)');
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, size, size);
            
            ctx.restore();
        }

        this.setupCanvas();
    }

    destroy() {
        super.destroy();
    }

    // Deal damage to the player
    execDamage() {
        // Do not apply damage while the battleroom intro/fade is running
        if (typeof window !== 'undefined' && window.__battleRoomFadeComplete === false) {
            return;
        }

        // Find all enemies for damage modifier
        const enemies = this.gameEnv.gameObjects.filter(obj => 
            obj.constructor.name === 'Boss' || obj.constructor.name === 'Enemy'
        );
        let ATTACK_MODIFIER;
        if (enemies.length === 0) {
            ATTACK_MODIFIER = 1;
        } else {
            const enemy = enemies[0];
            if (enemy.stage >= 3) {
                ATTACK_MODIFIER = 1.5; // Charge does more damage in stage 3
            } else {
                ATTACK_MODIFIER = 1;
            }
        }

        // Charge attack has larger hitbox
        const HIT_DISTANCE = 80;
        const CHARGE_DAMAGE = Math.round(25 * ATTACK_MODIFIER); // More damage than scythe
        
        const players = this.gameEnv.gameObjects.filter(obj => 
            obj.constructor.name === 'Player' || obj.constructor.name === 'FightingPlayer'
        );
        if (players.length === 0) return null;

        let nearest = players[0];
        let minDist = Infinity;

        // Find the closest player
        for (const player of players) {
            const dx = player.position.x - this.position.x;
            const dy = player.position.y - this.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
                minDist = dist;
                nearest = player;
            }
        }

        // Do distance formula calculation
        const xDiff = nearest.position.x - this.position.x;
        const yDiff = nearest.position.y - this.position.y;
        const distanceFromPlayer = Math.sqrt(xDiff * xDiff + yDiff * yDiff);

        if (distanceFromPlayer <= HIT_DISTANCE) {
            this.revComplete = true;
            this.destroy();
            if (!nearest.data) nearest.data = { health: 100 }; // Initialize health if not exists
            nearest.data.health -= CHARGE_DAMAGE;
            console.log("Player hit by charge! Health:", nearest.data.health);
            if (nearest.data.health <= 0) {
                console.log("Game over -- the player has been defeated!");
                showDeathScreen(nearest);
            }
        }

        // Update the player health bar
        try {
            if (nearest && nearest.data && typeof updatePlayerHealthBar === 'function') {
                const pct = Math.max(0, Math.min(100, nearest.data.health || 0));
                updatePlayerHealthBar(pct);
            }
        } catch (e) {
            console.warn('Failed to update player health bar:', e);
        }
    }
}

export default ChargeAttack;