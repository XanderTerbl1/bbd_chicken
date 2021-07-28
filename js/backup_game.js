const BOARD_SIZE = 15 // dimensions 
const TILE_SIZE = 80 // height & width px

function boardAt(row, col) {
    return document.getElementById(`tile-${row}-${col}`);
}

function createGameBoard() {
    let board = document.getElementById("game-board");
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            let tile = document.createElement("div");
            tile.setAttribute("class", 'game-tile');
            tile.setAttribute("id", `tile-${row}-${col}`);
            // tile.textContent = `tile-${row}-${col}`
            tile.style.width = `${TILE_SIZE}px`
            tile.style.height = `${TILE_SIZE}px`
            board.appendChild(tile)
        }
    }
    board.style.width = (BOARD_SIZE * TILE_SIZE) + "px";
}


class Player{
    constructor(){
        this.player = document.createElement("div");
        this.player.setAttribute("class", "player center-tile");   
        this.player_position = [14,6];
    }

    spawnPlayer(){
        let row = this.player_position[0]
        let col = this.player_position[1]
        boardAt(row, col).appendChild(this.player);        
    }
    
    movePlayer(dir){
        // remove current
        this.player.remove()

        // TODO Make dir enum
        switch (dir) {
            // UP
            case 1:
                this.player_position[0] = this.player_position[0] -1;
                break;
                
            // Down
            case 2:
                this.player_position[0] = this.player_position[0] + 1;
                break;
        
            default:
                break;
        }

        // update position       
        this.spawnPlayer();        
    }
}

// Initialising
createGameBoard();
player = new Player()
player.spawnPlayer();



