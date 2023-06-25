import { GameScene } from './scenes/GameScene';
import './style.css'

// create game config
const config = {
  type: Phaser.AUTO,
  scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1920,
      height: 1080,
  },
  scene: [GameScene],
  pixelArt: true
}

// create the phaser game
const game = new Phaser.Game(config);
