import GameEnvBackground from './murderMysteryGameLogic/GameEnvBackground.js';
import FightingPlayer from './bossLevel/FightingPlayer.js';
import Boss from './bossLevel/Boss.js';
import showDeathScreen from './bossLevel/DeathScreen.js';

console.log("🎮 murderMysteryBossFight.js loaded!");

class MurderMysteryBossFight {
    constructor(gameEnv) {
        console.log("🎮 MurderMysteryBossFight constructor started");
        
        let width = gameEnv.innerWidth;
        let height = gameEnv.innerHeight;
        let path = gameEnv.path;
        
        this.gameEnv = gameEnv;
        this._playerDeathShown = false;
        this.cutsceneComplete = false;
        this.gameStarted = false;
        
        // Healing system
        this.healsRemaining = 3;
        this.healAmount = 25; // Heals 25 HP per use
        this.canHeal = true;
        
        // Background setup
        const image_background = path + "/images/mansionGame/bossroom.png";
        const image_data_background = {
            name: 'background',
            src: image_background,
            pixels: {height: 580, width: 1038},
            mode: 'cover',
        };
        
        // Player setup - FightingPlayer with WASD + Spacebar attack
        const sprite_src_mc = path + "/images/gamify/spookMcWalk.png";
        const MC_SCALE_FACTOR = 6;
        const playerData = {
            id: 'Spook',
            greeting: "Time to defeat the Reaper!",
            src: sprite_src_mc,
            SCALE_FACTOR: MC_SCALE_FACTOR,
            STEP_FACTOR: 80,
            ANIMATION_RATE: 10,
            INIT_POSITION: { 
                x: (width / 2 - width / (5 * MC_SCALE_FACTOR)), 
                y: height - (height / MC_SCALE_FACTOR)
            }, 
            pixels: {height: 2400, width: 3600},
            orientation: {rows: 2, columns: 3},
            down: {row: 1, start: 0, columns: 3},
            downRight: {row: 1, start: 0, columns: 3, rotate: Math.PI/16},
            downLeft: {row: 0, start: 0, columns: 3, rotate: -Math.PI/16},
            left: {row: 0, start: 0, columns: 3},
            right: {row: 1, start: 0, columns: 3},
            up: {row: 1, start: 0, columns: 3},
            upLeft: {row: 0, start: 0, columns: 3, rotate: Math.PI/16},
            upRight: {row: 1, start: 0, columns: 3, rotate: -Math.PI/16},
            hitbox: {widthPercentage: 0.45, heightPercentage: 0.2},
            keypress: {up: 87, down: 83, left: 65, right: 68}, // WASD
            data: { health: 100 } // Player health
        };
        
        // Boss setup
        const BOSS_SCALE_FACTOR = 8;
        const bossData = {
            id: 'Reaper',
            greeting: "I am the Reaper!",
            src: path + "/images/mansionGame/reaper.png",
            SCALE_FACTOR: BOSS_SCALE_FACTOR,
            STEP_FACTOR: 0, // Boss doesn't walk around
            ANIMATION_RATE: 10,
            INIT_POSITION: { x: width / 2, y: height / 4 }, // Boss starts at top-center
            pixels: {height: 2400, width: 3600},
            orientation: {rows: 1, columns: 1},
            down: {row: 0, start: 0, columns: 1},
            hitbox: {widthPercentage: 0.6, heightPercentage: 0.6},
            initialHealth: 1500,
            attackInterval: 2000
        };
        
        // Classes array
        this.classes = [
            { class: GameEnvBackground, data: image_data_background },
            { class: FightingPlayer, data: playerData },
            { class: Boss, data: bossData }
        ];
        
        // Set up healing controls
        this.setupHealingControls();
        
        // Start the cutscene
        this.showCutscene();
        
        console.log("✅ MurderMysteryBossFight constructor completed");
    }
    
    setupHealingControls() {
        // Listen for 'E' key press
        this.healHandler = (event) => {
            if (event.code === 'KeyE' || event.key === 'e' || event.key === 'E') {
                event.preventDefault();
                this.useHeal();
            }
        };
        
        window.addEventListener('keydown', this.healHandler);
    }
    
    useHeal() {
        // Don't allow healing during cutscene
        if (!this.cutsceneComplete) {
            return;
        }
        
        // Check if heals are available
        if (this.healsRemaining <= 0) {
            console.log("❌ No heals remaining!");
            this.showHealMessage("No heals left!", '#FF0000');
            return;
        }
        
        // Find player
        const player = this.gameEnv.gameObjects.find(obj => 
            obj.constructor.name === 'FightingPlayer'
        );
        
        if (!player || !player.data) {
            return;
        }
        
        // Check if already at full health
        if (player.data.health >= 100) {
            console.log("❌ Already at full health!");
            this.showHealMessage("Already at full health!", '#FFD700');
            return;
        }
        
        // Apply heal
        const oldHealth = player.data.health;
        player.data.health = Math.min(100, player.data.health + this.healAmount);
        const actualHeal = player.data.health - oldHealth;
        
        this.healsRemaining--;
        
        console.log(`💚 Used heal! +${actualHeal} HP. Heals remaining: ${this.healsRemaining}`);
        
        // Update player health bar
        try {
            const updatePlayerHealthBar = require('./bossLevel/HealthBars.js').updatePlayerHealthBar;
            if (typeof updatePlayerHealthBar === 'function') {
                updatePlayerHealthBar(player.data.health);
            }
        } catch (e) {
            // Health bar update not critical
        }
        
        // Show heal effect
        this.showHealEffect(player);
        this.showHealMessage(`+${actualHeal} HP! (${this.healsRemaining} heals left)`, '#00FF00');
        
        // Update HUD to show remaining heals
        this.updateHUD();
    }
    
    showHealEffect(player) {
        // Create healing particle effect
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '8px';
            particle.style.height = '8px';
            particle.style.backgroundColor = '#00FF00';
            particle.style.borderRadius = '50%';
            particle.style.left = `${player.position.x + player.width/2}px`;
            particle.style.top = `${player.position.y + player.height/2}px`;
            particle.style.zIndex = '9999';
            particle.style.boxShadow = '0 0 10px #00FF00';
            document.body.appendChild(particle);
            
            // Animate particles upward
            const offsetX = (Math.random() - 0.5) * 60;
            const offsetY = -Math.random() * 80 - 40; // Move up
            
            particle.animate(
                [
                    { transform: 'translate(0, 0)', opacity: 1 },
                    { transform: `translate(${offsetX}px, ${offsetY}px)`, opacity: 0 }
                ],
                {
                    duration: 800,
                    easing: 'ease-out',
                    fill: 'forwards'
                }
            );
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 800);
        }
    }
    
    showHealMessage(text, color) {
        // Create temporary message
        const message = document.createElement('div');
        message.style.position = 'fixed';
        message.style.top = '50%';
        message.style.left = '50%';
        message.style.transform = 'translate(-50%, -50%)';
        message.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        message.style.color = color;
        message.style.padding = '15px 30px';
        message.style.borderRadius = '10px';
        message.style.fontFamily = 'Arial, sans-serif';
        message.style.fontSize = '20px';
        message.style.fontWeight = 'bold';
        message.style.zIndex = '99998';
        message.style.border = `2px solid ${color}`;
        message.style.boxShadow = `0 0 20px ${color}`;
        message.textContent = text;
        
        document.body.appendChild(message);
        
        // Fade out and remove
        setTimeout(() => {
            message.style.transition = 'opacity 0.5s';
            message.style.opacity = '0';
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 500);
        }, 1000);
    }
    
    showCutscene() {
        // Dialogue lines
        const dialogue = [
            {
                speaker: "Reaper",
                text: "You dare challenge me, mortal?",
                portrait: this.gameEnv.path + "/images/mansionGame/reaper_portrait.png"
            },
            {
                speaker: "Spook",
                text: "I've come to stop you once and for all!",
                portrait: this.gameEnv.path + "/images/gamify/spook_portrait.png"
            },
            {
                speaker: "Reaper",
                text: "So be it. Your soul shall join the others!",
                portrait: this.gameEnv.path + "/images/mansionGame/reaper_portrait.png"
            }
        ];
        
        let currentDialogueIndex = 0;
        
        // Create dialogue container
        const dialogueBox = document.createElement('div');
        dialogueBox.id = 'cutscene-dialogue';
        dialogueBox.style.position = 'fixed';
        dialogueBox.style.bottom = '50px';
        dialogueBox.style.left = '50%';
        dialogueBox.style.transform = 'translateX(-50%)';
        dialogueBox.style.width = '80%';
        dialogueBox.style.maxWidth = '800px';
        dialogueBox.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        dialogueBox.style.border = '3px solid #8B0000';
        dialogueBox.style.borderRadius = '10px';
        dialogueBox.style.padding = '20px 30px';
        dialogueBox.style.zIndex = '99999';
        dialogueBox.style.fontFamily = 'Arial, sans-serif';
        dialogueBox.style.boxShadow = '0 0 30px rgba(139, 0, 0, 0.5)';
        
        // Create portrait container
        const portraitContainer = document.createElement('div');
        portraitContainer.style.display = 'flex';
        portraitContainer.style.alignItems = 'center';
        portraitContainer.style.marginBottom = '15px';
        
        // Create portrait image
        const portrait = document.createElement('img');
        portrait.style.width = '80px';
        portrait.style.height = '80px';
        portrait.style.borderRadius = '50%';
        portrait.style.border = '2px solid #8B0000';
        portrait.style.marginRight = '15px';
        portrait.style.objectFit = 'cover';
        
        // Create speaker name
        const speakerName = document.createElement('div');
        speakerName.style.fontSize = '20px';
        speakerName.style.fontWeight = 'bold';
        speakerName.style.color = '#FF0000';
        
        portraitContainer.appendChild(portrait);
        portraitContainer.appendChild(speakerName);
        
        // Create text container
        const textContainer = document.createElement('div');
        textContainer.style.fontSize = '18px';
        textContainer.style.color = '#FFFFFF';
        textContainer.style.lineHeight = '1.5';
        textContainer.style.marginBottom = '15px';
        
        // Create continue prompt
        const continuePrompt = document.createElement('div');
        continuePrompt.style.fontSize = '14px';
        continuePrompt.style.color = '#888888';
        continuePrompt.style.textAlign = 'right';
        continuePrompt.style.fontStyle = 'italic';
        continuePrompt.innerHTML = 'Press SPACE to continue...';
        
        dialogueBox.appendChild(portraitContainer);
        dialogueBox.appendChild(textContainer);
        dialogueBox.appendChild(continuePrompt);
        
        document.body.appendChild(dialogueBox);
        
        // Function to show current dialogue
        const showDialogue = () => {
            if (currentDialogueIndex >= dialogue.length) {
                // End cutscene
                this.endCutscene();
                return;
            }
            
            const current = dialogue[currentDialogueIndex];
            
            // Update portrait (or hide if no portrait available)
            if (current.portrait) {
                portrait.src = current.portrait;
                portrait.style.display = 'block';
                portrait.onerror = () => {
                    // If portrait fails to load, hide it
                    portrait.style.display = 'none';
                };
            } else {
                portrait.style.display = 'none';
            }
            
            // Update speaker name color
            speakerName.textContent = current.speaker;
            if (current.speaker === 'Reaper') {
                speakerName.style.color = '#FF0000';
            } else {
                speakerName.style.color = '#00FF00';
            }
            
            // Update text
            textContainer.textContent = current.text;
            
            currentDialogueIndex++;
        };
        
        // Show first dialogue
        showDialogue();
        
        // Handle spacebar to continue
        this.cutsceneHandler = (event) => {
            if (event.code === 'Space' || event.key === ' ') {
                event.preventDefault();
                showDialogue();
            }
        };
        
        window.addEventListener('keydown', this.cutsceneHandler);
    }
    
    endCutscene() {
        console.log("🎬 Cutscene complete!");
        
        // Remove dialogue box
        const dialogueBox = document.getElementById('cutscene-dialogue');
        if (dialogueBox) {
            dialogueBox.remove();
        }
        
        // Remove cutscene handler
        if (this.cutsceneHandler) {
            window.removeEventListener('keydown', this.cutsceneHandler);
        }
        
        // Mark cutscene as complete
        this.cutsceneComplete = true;
        this.gameStarted = true;
        
        // Create HUD now that game is starting
        this.createHUD();
    }
    
    createHUD() {
        // Remove existing HUD if any
        const existingHUD = document.getElementById('bossfight-hud');
        if (existingHUD) {
            existingHUD.remove();
        }
        
        // Create HUD container
        const hud = document.createElement('div');
        hud.id = 'bossfight-hud';
        hud.style.position = 'fixed';
        hud.style.top = '80px';
        hud.style.left = '50%';
        hud.style.transform = 'translateX(-50%)';
        hud.style.zIndex = '99999';
        hud.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        hud.style.color = 'white';
        hud.style.padding = '15px 30px';
        hud.style.borderRadius = '10px';
        hud.style.fontFamily = 'Arial, sans-serif';
        hud.style.fontSize = '20px';
        hud.style.fontWeight = 'bold';
        hud.style.textAlign = 'center';
        hud.innerHTML = `
            <div style="color: #ff0000; margin-bottom: 5px;">⚔️ BOSS FIGHT ⚔️</div>
            <div style="color: #00ff00; font-size: 16px;">SPACE to attack | WASD to move | E to heal</div>
            <div style="color: #00ff00; font-size: 14px; margin-top: 5px;">💚 Heals: ${this.healsRemaining}/3</div>
        `;
        
        document.body.appendChild(hud);
    }
    
    updateHUD() {
        const hud = document.getElementById('bossfight-hud');
        if (hud) {
            hud.innerHTML = `
                <div style="color: #ff0000; margin-bottom: 5px;">⚔️ BOSS FIGHT ⚔️</div>
                <div style="color: #00ff00; font-size: 16px;">SPACE to attack | WASD to move | E to heal</div>
                <div style="color: #00ff00; font-size: 14px; margin-top: 5px;">💚 Heals: ${this.healsRemaining}/3</div>
            `;
        }
    }
    
    update() {
        // Don't update game logic until cutscene is complete
        if (!this.cutsceneComplete) {
            return;
        }
        
        // Check if player is dead
        const player = this.gameEnv.gameObjects.find(obj => 
            obj.constructor.name === 'FightingPlayer'
        );
        
        if (player && player.data && player.data.health <= 0) {
            if (!this._playerDeathShown) {
                this._playerDeathShown = true;
                console.log("💀 Player defeated!");
                showDeathScreen(player);
            }
        }
    }
    
    destroy() {
        console.log("🧹 Cleaning up MurderMysteryBossFight...");
        
        // Remove HUD
        const hud = document.getElementById('bossfight-hud');
        if (hud) {
            hud.remove();
        }
        
        // Remove dialogue box if still present
        const dialogueBox = document.getElementById('cutscene-dialogue');
        if (dialogueBox) {
            dialogueBox.remove();
        }
        
        // Remove cutscene handler if still active
        if (this.cutsceneHandler) {
            window.removeEventListener('keydown', this.cutsceneHandler);
        }
        
        // Remove heal handler
        if (this.healHandler) {
            window.removeEventListener('keydown', this.healHandler);
        }
        
        console.log("✅ MurderMysteryBossFight cleanup complete");
    }
}

export default MurderMysteryBossFight;