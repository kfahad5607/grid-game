import {
    log,
    boldLog,
    successLog,
    infoLog,
    warnLog,
    dangerLog,
} from "./styledLog.js";

const TARGET = "X";
const EMPTY_CELL = " ";
const CELL_SPACE = "  ";
const GAME_STATES = {
    NON_STARTED: "not-started",
    STARTED: "started",
    OVER: "over",
};
const LOG_STYLES = {
    TARGET: { bold: true, underlined: true, color: "green" },
    PLAYER: { bold: true, underlined: true, color: "blue" },
    COLLISON_CELL: { bold: true, underlined: true, color: "red" },
    EMPTY_CELL: { bold: true, underlined: true },
};

function padString(str, length) {
    if (str.length >= length) return str;

    return str + " ".repeat(length - str.length);
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function* getIdGenerator() {
    let i = 1;
    while (true) {
        yield i.toString().padStart(3, "0");
        i++;
    }
}

const idGenerator = getIdGenerator();

class Game {
    #id;
    #gameState = GAME_STATES.NON_STARTED;
    #grid;
    #rows;
    #cols;
    #players;
    #winner;
    #targetPosition;
    #turnsCount;
    #maxPlayerNameLength = 1;
    #eliminatedPlayersMap = {};

    constructor(rows, cols) {
        this.#id = idGenerator.next().value;
        this.#rows = rows;
        this.#cols = cols;
        this.#players = new Map();
        this.#turnsCount = 1;

        this.#initGrid();
        this.#setTarget();

        boldLog(
            `**************  Game ${this.#id
            } about to start shortly!  **************\n`
        );
    }

    static create(rows, cols) {
        return new Game(rows, cols);
    }

    get isGameOver() {
        return this.#gameState === GAME_STATES.OVER;
    }

    get isGameStarted() {
        return this.#gameState === GAME_STATES.STARTED;
    }

    #initGrid() {
        this.#grid = [];

        for (let i = 0; i < this.#rows; i++) {
            const colElements = [];
            for (let j = 0; j < this.#cols; j++) {
                colElements.push(EMPTY_CELL);
            }
            this.#grid.push(colElements);
        }
    }

    #setTarget() {
        const row = getRandomNumber(0, this.#rows - 1);
        const col = getRandomNumber(0, this.#cols - 1);

        this.#targetPosition = [row, col];
        this.#grid[row][col] = TARGET;
    }

    #validatePlayer(player) {
        // players allowed < empty cells
        const maxPlayersAllowed = this.#rows * this.#cols - 1;
        if (this.isGameOver) {
            return warnLog(`Game ${this.#id} is over. Cannot add new Players.`);
        }
        if (this.#players.size >= maxPlayersAllowed) {
            return warnLog(
                `Only ${maxPlayersAllowed} player(s) can join the Game ${this.#id
                }. No more players allowed!`
            );
        }

        if (!player.name) return dangerLog("Invalid player!");
        if (this.#players.has(player.name)) return;
        if (player.position)
            return warnLog(
                `Player ${player.name
                } is already playing another game. Cannot join Game ${this.#id}`,
                {
                    collor: "red",
                }
            );

        if (player.name === TARGET) player.rename();
    }

    addPlayer(player) {
        this.#validatePlayer(player);

        const blankPositions = [];
        for (let i = 0; i < this.#grid.length; i++) {
            const gridItem = this.#grid[i];

            for (let j = 0; j < gridItem.length; j++) {
                if (gridItem[j] === EMPTY_CELL) {
                    blankPositions.push([i, j]);
                }
            }
        }

        const positionIndex = getRandomNumber(0, blankPositions.length - 1);
        player.position = blankPositions[positionIndex];
        this.#players.set(player.name, player);

        this.#grid[player.position[0]][player.position[1]] = player.name;
        this.#maxPlayerNameLength = Math.max(
            player.name.length,
            this.#maxPlayerNameLength
        );

        infoLog(`Player ${player.name} joined the Game ${this.#id}.`);
    }

    #eliminatePlayer(playerName) {
        this.#players.delete(playerName);
    }

    #approachTargetPosition(position) {
        let [playerRow, playerCol] = position;
        let [targetRow, targetCol] = this.#targetPosition;

        if (playerRow === targetRow) {
            if (playerCol > targetCol) playerCol--;
            else playerCol++;
        } else if (playerCol === targetCol) {
            if (playerRow > targetRow) playerRow--;
            else playerRow++;
        } else {
            if (playerCol > targetCol) playerCol--;
            else playerCol++;
            if (playerRow > targetRow) playerRow--;
            else playerRow++;
        }

        return [playerRow, playerCol];
    }

    #checkPlayersLeft() {
        if (this.#players.size === 0) {
            warnLog("No players to play. Game over! \n");
            this.#gameState = GAME_STATES.OVER;
        }
    }

    #getPositionKey(row, col) {
        return `${row}-${col}`;
    }

    #playTurn() {
        this.#turnsCount++;
        
        for (const [, player] of this.#players) {
            this.#grid[player.position[0]][player.position[1]] = EMPTY_CELL;
            player.position = this.#approachTargetPosition(player.position);
        }

        this.#eliminatedPlayersMap = {};
        const nonPlayerCells = [TARGET, EMPTY_CELL];

        this.#winner = null;
        for (const [, player] of this.#players) {
            const [row, col] = player.position;
            const currentItem = this.#grid[row][col];
            const positionKey = this.#getPositionKey(row, col);

            if (
                nonPlayerCells.includes(currentItem) &&
                !this.#eliminatedPlayersMap[positionKey]
            ) {
                this.#grid[row][col] = player.name;
                if (currentItem === TARGET) this.#winner = player.name;

                continue;
            }

            if (!this.#eliminatedPlayersMap[positionKey])
                this.#eliminatedPlayersMap[positionKey] = [];

            if (this.#players.has(currentItem)) {
                this.#eliminatedPlayersMap[positionKey].push(currentItem);
                this.#eliminatePlayer(currentItem);

                if (currentItem === this.#winner) this.#winner = null;
            }
            if (this.#players.has(player.name)) {
                this.#eliminatedPlayersMap[positionKey].push(player.name);
                this.#eliminatePlayer(player.name);
            }

            if (this.#targetPosition[0] === row && this.#targetPosition[1] === col) {
                this.#grid[row][col] = TARGET;
            } else {
                this.#grid[row][col] = EMPTY_CELL;
            }
        }

        this.#displayGrid();
        for (const positionKey in this.#eliminatedPlayersMap) {
            let eliminatedPlayersStr = "";
            const eliminatedPlayers = this.#eliminatedPlayersMap[positionKey];
            eliminatedPlayers.forEach((playerName, playerIdx) => {
                let separator = "";
                if (playerIdx > 0 && playerIdx < eliminatedPlayers.length - 1) {
                    separator = ", ";
                } else if (
                    playerIdx > 0 &&
                    playerIdx === eliminatedPlayers.length - 1
                ) {
                    separator = " and ";
                }
                eliminatedPlayersStr += separator + playerName;
            });

            dangerLog(
                `Collision occured at position ${positionKey}!! Eliminating players ${eliminatedPlayersStr}.`
            );
        }

        this.#checkPlayersLeft();
        if (this.#winner) {
            successLog(
                `Player ${this.#winner} has won the Game ${this.#id}. Game over!\n`
            );
            this.#gameState = GAME_STATES.OVER;
        }
    }

    #displayGrid() {
        const currentTurn = this.#turnsCount.toString().padStart(3, "0");
        boldLog(`\nGame ${this.#id} Turn ${currentTurn}:`);

        const logArgs = [];
        for (let i = 0; i < this.#grid.length; i++) {
            const gridItem = this.#grid[i];
            for (let j = 0; j < gridItem.length; j++) {
                let styles = LOG_STYLES.PLAYER;

                if (this.#eliminatedPlayersMap[this.#getPositionKey(i, j)]) {
                    styles = LOG_STYLES.COLLISON_CELL;
                } else if (gridItem[j] === TARGET || gridItem[j] === this.#winner) {
                    styles = LOG_STYLES.TARGET;
                } else if (gridItem[j] === EMPTY_CELL) {
                    styles = LOG_STYLES.EMPTY_CELL;
                }

                logArgs.push({
                    message: padString(gridItem[j], this.#maxPlayerNameLength),
                    styles,
                });
                logArgs.push({ message: CELL_SPACE });
            }
            logArgs.push({ message: "\n" });
        }
        log(logArgs);
    }

    start() {
        if (this.isGameStarted) return;
        this.#gameState = GAME_STATES.STARTED;

        this.#displayGrid();
        this.#checkPlayersLeft();

        if (this.isGameOver) return;

        let interval = -1;
        interval = setInterval(() => {
            this.#playTurn();

            if (this.isGameOver) clearInterval(interval);
        }, 2000);
    }
}

export default Game;
