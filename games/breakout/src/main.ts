// Bootstrap: wires the SDK + game orchestrator. Loop/input/renderer wiring
// lives inside BreakoutGame (see src/game/breakout-game.ts).
import { createLocalSdk } from "../../../sdk";
import { BreakoutGame } from "./game/breakout-game";

const GAME_ID = "breakout"; // must match the game folder name

const stage = document.getElementById("game-stage");
if (!stage) throw new Error("#game-stage missing in index.html");

const game = new BreakoutGame(stage, createLocalSdk(GAME_ID), GAME_ID);
void game.start();
