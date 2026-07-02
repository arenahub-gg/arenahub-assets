// Bootstrap: wires engine modules + SDK + game. When you replace ExampleGame,
// keep this structure — loop/input/renderer/SDK wiring stays the same.
import { createLocalSdk } from "../../../sdk";
import { GameLoop } from "./core/game-loop";
import { KeyboardInput } from "./core/keyboard-input";
import { TouchInput } from "./core/touch-input";
import { CanvasRenderer } from "./core/canvas-renderer";
import { ExampleGame } from "./game/example-game";

const GAME_ID = "RENAME-ME"; // must match the game folder name

const stage = document.getElementById("game-stage");
if (!stage) throw new Error("#game-stage missing in index.html");

const sdk = createLocalSdk(GAME_ID);
void sdk; // use for submitScore/getHighScore/storage in your game

const renderer = new CanvasRenderer(stage);
const game = new ExampleGame();

const keyboard = new KeyboardInput();
keyboard.attach();
keyboard.onPress("ArrowUp", () => game.setDirection("up"));
keyboard.onPress("ArrowDown", () => game.setDirection("down"));
keyboard.onPress("ArrowLeft", () => game.setDirection("left"));
keyboard.onPress("ArrowRight", () => game.setDirection("right"));
keyboard.onPress("KeyW", () => game.setDirection("up"));
keyboard.onPress("KeyS", () => game.setDirection("down"));
keyboard.onPress("KeyA", () => game.setDirection("left"));
keyboard.onPress("KeyD", () => game.setDirection("right"));

const touch = new TouchInput(stage);
touch.attach();
touch.onSwipe((dir) => game.setDirection(dir));

new GameLoop({
  update: (dt) => game.update(dt),
  render: () => game.render(renderer),
}).start();
