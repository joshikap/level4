import GameEnvBackground  from "./MansionLogic/GameEnvBackground.js";
import Player from "./MansionLogic/Player.js";
import Npc from './MansionLogic/Npc.js';
import MansionLevel6_BattleRoom from './mansionLevel6_BattleRoom.js';
import DialogueSystem from "./DialogueSystem.js";

class MansionLevel6 {
   constructor(gameEnv){

        // upon mansion level6 construction, 

        // keep reference to gameEnv for lifecycle methods
        this.gameEnv = gameEnv;

        let width = gameEnv.innerWidth;
        let height = gameEnv.innerHeight;
        let path = gameEnv.path;


        // Pause DOM audio elements
        try {
            const audioElements = document.querySelectorAll('audio'); // Selects all <audio> elements
            audioElements.forEach(audio => {
                try { if (!audio.paused) audio.pause(); } catch (e) {}
            });
        } catch (e) { /* ignore */ }

        let randomSong = ["marioCastle.mp3", "legendZelda.mp3"][Math.floor(Math.random()*2)]
        const levelMusic = new Audio(path + `/assets/sounds/mansionGame/${randomSong}`);
        levelMusic.loop = true;
        levelMusic.volume = 0.3;
        levelMusic.play().catch(err => console.warn('Level music failed to play:', err));
        try { if (typeof window !== 'undefined') window._levelMusic = levelMusic; } catch (e) {}

        const image_src_chamber = path + "/images/mansionGame/bgBossIntroChamber.png"
        const image_data_chamber = {
            name: 'bossintro',
            greeting: "The air is thick with suspicion. This is where the truth hides.",
            src: image_src_chamber,
            pixels: {height: 580, width: 1038},
            mode: 'stretch'
        };
        
        const sprite_src_mc = path + "/images/mansionGame/spookMcWalk.png";
        const MC_SCALE_FACTOR = 6;
        const sprite_data_mc = {
            id: 'Spook',
            greeting: "Spook grips their weapon tightly. The final suspect awaits.",
            src: sprite_src_mc,
            SCALE_FACTOR: MC_SCALE_FACTOR,
            STEP_FACTOR: 300,
            ANIMATION_RATE: 10,
            INIT_POSITION: { x: (width / 2 - width / (5 * MC_SCALE_FACTOR)), y: height - (height / MC_SCALE_FACTOR)}, 
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
            keypress: {up: 87, left: 65, down: 83, right: 68}
        };

        const sprite_src_zombie = path + "/images/mansionGame/zombieNpc.png";
        const sprite_greet_zombie = "The dead whisper clues...";
        const sprite_data_zombie1 = {
            id: 'ZombieNPC1',
            greeting: sprite_greet_zombie,
            src: sprite_src_zombie,
            SCALE_FACTOR: 4,
            ANIMATION_RATE: 30,
            pixels: {width: 3600, height: 1200},
            INIT_POSITION: {x: (width * 9 / 16), y: (height * 1 / 4)},
            orientation: {rows: 1, columns: 3 },
            down: {row: 0, start: 0, columns: 3 },
            hitbox: {widthPercentage: 0.2, heightPercentage: 0.2},
            dialogues: [
                "The final suspect waits beyond those doors...",
                "The Reaper was the last to see the victim alive.",
                "The murder weapon was never found... until now.",
                "Take this blade — it may be your only hope.",
                "You received: Sword.",
                "Good luck, detective. May you survive what lies ahead."
            ],
            reaction: function() {},
            interact: function() {
                if (this.dialogueSystem && this.dialogueSystem.isDialogueOpen()) {
                    this.dialogueSystem.closeDialogue();
                }
                if (!this.dialogueSystem) {
                    this.dialogueSystem = new DialogueSystem();
                }
                const whattosay = this.data.dialogues[Math.floor(Math.random() * this.data.dialogues.length)];
                this.dialogueSystem.showDialogue(
                    whattosay,
                    "Narrator",
                    this.spriteData.src
                );
            }
        };

        const sprite_data_bossdoor = {
            id: 'Door',
            greeting: "The chamber of the Reaper awaits.",
            src: path + "/images/mansionGame/invisDoorCollisionSprite.png",
            SCALE_FACTOR: 6,
            ANIMATION_RATE: 100,
            pixels: {width: 2029, height: 2025},
            INIT_POSITION: {x: (width * 37 / 80), y: (height / 8)},
            orientation: {rows: 1, columns: 1},
            down: {row: 0, start: 0, columns: 1},
            hitbox: {widthPercentage: 0.1, heightPercentage: 0.2},
            dialogues: [
                "Behind this door stands the Reaper.",
                "He orchestrated the murder from the shadows.",
                "Face him, and uncover the truth."
            ],
            reaction: function() {},
            interact: function() {
                if (this.dialogueSystem && this.dialogueSystem.isDialogueOpen()) {
                    this.dialogueSystem.closeDialogue();
                }
                if (!this.dialogueSystem) {
                    this.dialogueSystem = new DialogueSystem();
                }
                this.dialogueSystem.showDialogue(
                    "The Reaper awaits. Are you ready to confront the killer?",
                    "Door",
                    this.spriteData.src
                );
                this.dialogueSystem.addButtons([
                    {
                        text: "Enter doors",
                        primary: true,
                        action: () => {
                            this.dialogueSystem.closeDialogue();
                            gameEnv.gameControl.levelClasses = [MansionLevel6_BattleRoom];
                            gameEnv.gameControl.currentLevelIndex = 0;
                            gameEnv.gameControl.transitionToLevel();
                        }
                    },
                    {
                        text: "Not Ready",
                        action: () => {
                            this.dialogueSystem.closeDialogue();
                        }
                    }
                ]);
            }
        };

        const sprite_data_sworddrop = {
            id: 'SwordDrop',
            greeting: "The Reaper has fallen...",
            src: sprite_src_zombie,
            SCALE_FACTOR: 4,
            ANIMATION_RATE: 30,
            pixels: {width: 3600, height: 1200},
            INIT_POSITION: {x: (width / 2), y: (height / 2)},
            orientation: {rows: 1, columns: 1},
            down: {row: 0, start: 0, columns: 1},
            hitbox: {widthPercentage: 0.2, heightPercentage: 0.2},
            dialogues: [
                "The Reaper collapses into ash.",
                "From the shadows emerges a blade glowing with dark enchantment.",
                "You obtained: Enchanted Soulreaver Sword.",
                "Its edge hums with justice fulfilled.",
                "Congratulations. The murderer has been defeated.",
                "The mansion grows silent once more.",
                "CREDITS",
                "Our classmates for creating all levels",
                "Mr. Mort for guiding us through our first tri of computer science ."
            ],
            reaction: function() {},
            interact: function() {
                if (!this.dialogueSystem) {
                    this.dialogueSystem = new DialogueSystem();
                }
                const whattosay = this.data.dialogues[Math.floor(Math.random() * this.data.dialogues.length)];
                this.dialogueSystem.showDialogue(
                    whattosay,
                    "Narrator",
                    this.spriteData.src
                );
            }
        };

        this.classes = [
            {class: GameEnvBackground, data: image_data_chamber},
            {class: Player, data: sprite_data_mc},
            {class: Npc, data: sprite_data_zombie1},
            {class: Npc, data: sprite_data_bossdoor},
            {class: Npc, data: sprite_data_sworddrop}
        ];

    };
}

export default MansionLevel6;
