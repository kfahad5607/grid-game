import Game from "./game.js";
import Player from "./player.js";

const game1 = Game.create(5, 6); 

for (let i = 0; i < 10; i++) {
    game1.addPlayer(Player.create())
}

game1.start(); 