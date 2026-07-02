import { createLocalSdk } from "../../../sdk";
import { SnakeGame } from "./game/snake-game";

const stage = document.getElementById("game-stage");
if (!stage) throw new Error("#game-stage missing in index.html");

const game = new SnakeGame(stage, createLocalSdk("snake"));
void game.start();
