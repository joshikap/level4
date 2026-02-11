import Enemy from '../murderMysteryGameLogic/Enemy.js';
import Projectile from './Projectile.js';
import ChargeAttack from './Charge.js';
import showEndScreen from './EndScreen.js';
import Player from '../murderMysteryGameLogic/Player.js';
import HealthBars from './HealthBars.js';

/*
    Boss class to define the Reaper
    - Uses various attacks at an attack interval to damage the player
    - Has heath (see HealthBars.js for health bars)
    - Slowly moves towards the player
*/

class Boss extends Enemy {
    constructor(data = null, gameEnv = null) {
        super(data, gameEnv);

        // Lazy cache for the boss health fill DOM element (populated when available)
        this._bossHealthFill = null;

        this.stage = 1;
        this.fullHealth = data?.initialHealth || 1500;
        this.healthPoints = this.fullHealth;

        this.fireballs = [];
        this.charges = [];
        this.lastAttackTime = Date.now();
        this.attackInterval = data?.attackInterval || 2000;
        this.angerModifier = 1;
        this.attackProbShift = 0.05;

        this.projectileTypes = data?.projectileTypes || ['FIREBALL'];

        this.isCharging = false;
    }

    // Update function for the Boss
    update() {
        // === [ADDED] Update boss health bar ===
        // Lazily grab the fill element (the battle room creates it when the level loads)
        if (!this._bossHealthFill && typeof document !== 'undefined') {
            this._bossHealthFill = document.getElementById('boss-health-fill');
        }

        if (this._bossHealthFill) {
            // Guard against division by zero if fullHealth is ever 0
            const full = this.fullHealth || 1;
            const percent = Math.max(0, Math.min(100, (this.healthPoints / full) * 100));
            this._bossHealthFill.style.width = `${percent}%`;
            this._bossHealthFill.style.backgroundColor = percent < 33 ? '#A020F0' : percent < 66 ? '#800000' : '#FF0000';

            // If boss is dead, remove the health bar from the DOM (cleanup)
            if (this.healthPoints <= 0) {
                try {
                    const bar = document.getElementById('boss-health-bar');
                    if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
                } catch (e) { console.warn('Failed to remove boss health bar:', e); }
                this._bossHealthFill = null;
            }
        }

        // If boss health is 0 or less, do nothing for now.
        // If boss is dead, show end screen once (delegated to EndScreen module)
        if (this.healthPoints <= 0) {
            if (!this._victoryShown) {
                this._victoryShown = true;
                try {
                    showEndScreen(this.gameEnv);
                } catch (e) { console.error('Error showing end screen:', e); }
            }
            return;
        }
        // Update the position and draw the boss
        this.spriteData.update.call(this);
        this.draw();

        // Update stage & attack speed
        const healthRatio = this.healthPoints / this.fullHealth;
        this.stage = healthRatio < 0.33 ? 3 : (healthRatio < 0.66 ? 2 : 1);
        this.attackInterval = this.stage === 3 ? 1000 : this.stage === 2 ? 1500 : 2000;
        
        // Double damage at half health (50%) or below
        this.angerModifier = healthRatio <= 0.5 ? 2 : 1;

        // Update projectiles
        this.fireballs.forEach(p => {
            if (p.revComplete) {
                p.destroy();
            } else {
                p.update();
            }
        });
        this.fireballs = this.fireballs.filter(p => !p.revComplete);

        // Update charge
        this.charges.forEach(c => c.update());
        this.charges = this.charges.filter(c => !c.revComplete);
        if (this.charges.length === 0) {
            this.isCharging = false;
        }

        // Attack logic
        const now = Date.now();
        if (now - this.lastAttackTime >= this.attackInterval) {
            const target = this.findNearestPlayer();
            if (target) this.performAttack(target);
            this.lastAttackTime = now;
        }

        // Movement toward nearest player if not throwing scythe
        /*
        if (!this.isCharging) {
            const target = this.findNearestPlayer();
            if (target) this.moveToward(target, 0.25);
        }
        */
    }

    // Locate the nearest player
    findNearestPlayer() {
        const players = this.gameEnv.gameObjects.filter(obj => obj instanceof Player);
        if (players.length === 0) return null;

        let nearest = players[0];
        let minDist = Infinity;

        for (const player of players) {
            const dx = player.position.x - this.position.x;
            const dy = player.position.y - this.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
                minDist = dist;
                nearest = player;
            }
        }

        return nearest;
    }

    // Randomize attack chances
    performAttack(target) {
        const rand = Math.random();
        const attackProbModifier = this.attackProbShift * (this.stage - 1);
        
        if (this.stage >= 2 && rand < 0.3 + attackProbModifier) {
            this.chargeAttack(target);
        } else if (rand < 0.6 + attackProbModifier) {
            this.fireballAttack(target);
        }
        
    }

    // Move towards a certian location
    moveToward(target, speed) {
        const dx = target.position.x - this.position.x;
        const dy = target.position.y - this.position.y;
        const angle = Math.atan2(dy, dx);
        this.position.x += Math.cos(angle) * speed;
        this.position.y += Math.sin(angle) * speed;
    }

    // Disable the explode method
    explode(x, y) {
        throw new Error("Reapers cannot explode! (yet :})");
    }

    chargeAttack(target) {
    // Charge at the player
    this.charges.push(new ChargeAttack(this.gameEnv, this, target.position.x, target.position.y));
    this.isCharging = true;
}

    fireballAttack(target) {
        //this.rightArm.shoot();
        this.fireballs.push(new Projectile(this.gameEnv, target.position.x, target.position.y, this.position.x, this.position.y, "FIREBALL"));
    }

}

export default Boss;
