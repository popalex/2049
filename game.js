function generateUsername() {
    const uuid = crypto.randomUUID();
    const shortId = uuid.slice(0, 8);
    return `player_${shortId}`;
}

class Game2048 {
    constructor(container) {
        this.container = container;
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.bombProbability = 0.10; // 10% chance for bomb
        this.gameOver = false;
        this.setupGame();
        this.addExplosionStyles();
        this.username = generateUsername();
    }

    setupGame() {
        // Create grid cells
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                this.container.appendChild(cell);
            }
        }

        // Add initial tiles
        this.addRandomTile();
        this.addRandomTile();
        this.render();

        // Add keyboard event listener
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    addExplosionStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes explode {
                0% {
                    transform: scale(1);
                    opacity: 1;
                }
                50% {
                    transform: scale(1.2);
                    opacity: 0.5;
                }
                100% {
                    transform: scale(0);
                    opacity: 0;
                }
            }

            .explode {
                animation: explode 0.5s ease-out;
            }
        `;
        document.head.appendChild(style);
    }

    getRandomTile() {
        const random = Math.random();
        if (random < this.bombProbability) {
            return 'bomb';
        }
        if (random < 0.2) { // 20% chance to spawn multiplier tile
            return 'multiplier';
        }
        return Math.random() < 0.9 ? 2 : 4;
    }
    
    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }
    
        if (emptyCells.length > 0) {
            const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[row][col] = this.getRandomTile();
        }
    }    

    render() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const cell = document.querySelector(`.grid-cell[data-row="${i}"][data-col="${j}"]`);
                const value = this.grid[i][j];
                
                // Clear the class and text content
                cell.className = 'grid-cell';
                cell.textContent = ''; // Clear any previous content
    
                if (value !== 0) {
                    if (value === 'bomb') {
                        cell.classList.add('tile-bomb');
                    } else if (value === 'multiplier') {
                        cell.classList.add('tile-multiplier'); // Add multiplier tile class
                    } else {
                        cell.textContent = value;
                        cell.classList.add(`tile-${value}`);
                    }
                }
            }
        }
    
        // Update the score
        document.getElementById('score').textContent = this.score;
    }       

    handleKeyPress(event) {
        if (this.gameOver) return;
    
        let moved = false;
        switch (event.key) {
            case 'ArrowUp':
                moved = this.move('up');
                break;
            case 'ArrowDown':
                moved = this.move('down');
                break;
            case 'ArrowLeft':
                moved = this.move('left');
                break;
            case 'ArrowRight':
                moved = this.move('right');
                break;
            default:
                return;
        }
    
        if (moved) {
            this.addRandomTile();
            this.render();
            if (this.isGameOver()) {
                this.gameOver = true;
                this.showGameOver();  // Only call this here once
            }
        }
    }    

    move(direction) {
        let moved = false;
        const newGrid = Array(4).fill().map(() => Array(4).fill(0));
    
        switch (direction) {
            case 'up':
                for (let j = 0; j < 4; j++) {
                    let pos = 0;
                    for (let i = 0; i < 4; i++) {
                        if (this.grid[i][j] !== 0) {
                            if (pos > 0 && this.canMerge(i, j, pos - 1, j, newGrid)) {
                                moved = this.mergeTiles(i, j, pos - 1, j, newGrid) || moved;
                            } else {
                                newGrid[pos][j] = this.grid[i][j];
                                moved = pos !== i || moved;
                                pos++;
                            }
                        }
                    }
                }
                break;
    
            case 'down':
                for (let j = 0; j < 4; j++) {
                    let pos = 3;
                    for (let i = 3; i >= 0; i--) {
                        if (this.grid[i][j] !== 0) {
                            if (pos < 3 && this.canMerge(i, j, pos + 1, j, newGrid)) {
                                moved = this.mergeTiles(i, j, pos + 1, j, newGrid) || moved;
                            } else {
                                newGrid[pos][j] = this.grid[i][j];
                                moved = pos !== i || moved;
                                pos--;
                            }
                        }
                    }
                }
                break;
    
            case 'left':
                for (let i = 0; i < 4; i++) {
                    let pos = 0;
                    for (let j = 0; j < 4; j++) {
                        if (this.grid[i][j] !== 0) {
                            if (pos > 0 && this.canMerge(i, j, i, pos - 1, newGrid)) {
                                moved = this.mergeTiles(i, j, i, pos - 1, newGrid) || moved;
                            } else {
                                newGrid[i][pos] = this.grid[i][j];
                                moved = pos !== j || moved;
                                pos++;
                            }
                        }
                    }
                }
                break;
    
            case 'right':
                for (let i = 0; i < 4; i++) {
                    let pos = 3;
                    for (let j = 3; j >= 0; j--) {
                        if (this.grid[i][j] !== 0) {
                            if (pos < 3 && this.canMerge(i, j, i, pos + 1, newGrid)) {
                                moved = this.mergeTiles(i, j, i, pos + 1, newGrid) || moved;
                            } else {
                                newGrid[i][pos] = this.grid[i][j];
                                moved = pos !== j || moved;
                                pos--;
                            }
                        }
                    }
                }
                break;
        }
    
        if (moved) {
            this.grid = newGrid;
        }
    
        return moved;
    }

    canMerge(fromRow, fromCol, toRow, toCol, newGrid) {
        const fromValue = this.grid[fromRow][fromCol];
        const toValue = newGrid[toRow][toCol];
    
        // Check if the target tile is empty or if it can merge with the current tile
        if (toValue === 0) {
            return true;
        }
    
        // If either the from or to value is a multiplier, return true
        if (fromValue === 'multiplier' || toValue === 'multiplier') {
            return true;
        }

        // If either the from or to value is a bomb, return true
        if (fromValue === 'bomb' || toValue === 'bomb') {
            return true;
        }
    
        // Allow merging only if the values are the same (ignoring multipliers)
        return fromValue === toValue;
    }
    

    mergeTiles(row, col, newRow, newCol, newGrid) {
        const currentValue = this.grid[row][col];
        const targetValue = newGrid[newRow][newCol];
    
        // Handle bomb tiles
        if (currentValue === 'bomb' || targetValue === 'bomb') {
            this.explodeBomb(newRow, newCol);
            return true;
        }
    
        // Handle multiplier tile merging with number tile
        if (currentValue === 'multiplier' && typeof targetValue === 'number' && targetValue > 0) {
            // Apply the multiplier: Multiply the target tile value by 2 (adjust as needed)
            newGrid[newRow][newCol] *= 2;  // Assuming multiplier always multiplies by 2
            this.score += newGrid[newRow][newCol];
            return true;
        }

        // Handle multiplier tile merging with number tile
        if (targetValue === 'multiplier' && typeof currentValue === 'number' && currentValue > 0) {
            newGrid[newRow][newCol] = currentValue * 2;
            this.score += newGrid[newRow][newCol];
            console.log(`Multiplier tile merged with ${targetValue} at ${newRow}, ${newCol}, score updated: ${this.score}`);
            return true;
        }
    
        // Handle normal tile merging with another normal tile
        if (currentValue === targetValue) {
            newGrid[newRow][newCol] = currentValue * 2;
            this.score += newGrid[newRow][newCol];
            return true;
        }
    
        return false;
    }       
        

    explodeBomb(row, col) {
        // Clear 3x3 grid around the bomb
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
    
                // Check if within grid bounds
                if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
                    const cellValue = this.grid[newRow][newCol];
    
                    // If it's not a bomb and it's not a multiplier, clear the cell
                    if (cellValue !== 'multiplier') {
                        this.grid[newRow][newCol] = 0; // Clear the cell
                    }
                    // If it's a multiplier, give bonus points but don't remove it
                    if (cellValue === 'multiplier') {
                        this.score += 50; // Bonus for multiplier tiles in the explosion zone
                    }
                }
            }
        }
    
        // Add some points for using the bomb
        this.score += 100;
    }
    

    isGameOver() {
        // Check for empty cells
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) {
                    return false; // Game not over if there's an empty cell
                }
            }
        }
    
        // Check for possible merges horizontally and vertically
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const currentValue = this.grid[i][j];
    
                // Skip bomb tiles because they don't merge with numbers
                if (currentValue === 'bomb') continue;
    
                // Check right neighbor
                if (j < 3) {
                    const rightValue = this.grid[i][j + 1];
                    if (currentValue === rightValue) {
                        return false; // Game not over if merge is possible
                    }
                }
    
                // Check bottom neighbor
                if (i < 3) {
                    const bottomValue = this.grid[i + 1][j];
                    if (currentValue === bottomValue) {
                        return false; // Game not over if merge is possible
                    }
                }
            }
        }
    
        return true; // Game is over if no moves are possible
    }

    showGameOver() {
        const gameOver = document.createElement('div');
        gameOver.className = 'game-over';
        gameOver.innerHTML = `
            <div class="game-over-message">Game Over!</div>
            <div>Final Score: ${this.score}</div>
            <button class="restart-btn">Play Again</button>
        `;
        document.body.appendChild(gameOver);
        gameOver.style.display = 'block';

        const restartBtn = gameOver.querySelector('.restart-btn');
        restartBtn.addEventListener('click', () => {
            this.restart();
            gameOver.remove();
        });
    }

    getUsername() {
        return this.username;
    }

    getScore() {
        return this.score;
    }

    getGrid() {
        return this.grid;
    }

    restart() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.gameOver = false;
        this.addRandomTile();
        this.addRandomTile();
        this.render();
        // Don't reset the username on restart !
        // this.username = generateUsername();
    }

}

function startNewGame() {
    game.restart();
    updateUI();
}

function updateUsername() {
    game.username = generateUsername();
    updateUI();
}

function updateUI() {
    const grid = game.getGrid();
    const cells = document.querySelectorAll('.grid-cell');
    const username = game.getUsername();
    
    // Update username display
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        usernameElement.textContent = username;
    }
    
    // Update score display
    document.getElementById('score').textContent = game.score;

    cells.forEach((cell) => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const value = grid[row][col];
        
        // First clear both className and content
        cell.className = 'grid-cell';
        cell.textContent = '';
        
        if (value !== 0) {
            if (value === 'bomb') {
                cell.classList.add('tile-bomb');
            } else if (value === 'multiplier') {
                cell.classList.add('tile-multiplier');
                cell.textContent = '×2';  // Display multiplier factor
            } else {
                cell.textContent = value;
                cell.classList.add(`tile-${value}`);
            }
        }
    });

    // Don't check for game over again in updateUI, it's handled in handleKeyPress
    const gameOverElement = document.getElementById('game-over');
    if (gameOverElement) {
        gameOverElement.style.display = game.gameOver ? 'block' : 'none';
    }
}


// Find or create the container element
const container = document.querySelector('.grid-container');
// Initialize the game with the container
const game = new Game2048(container);

updateUI();

// Add event listeners
document.addEventListener('keydown', (event) => {
    game.handleKeyPress(event);
    updateUI();
});

document.getElementById('new-game-btn').addEventListener('click', startNewGame);
document.getElementById('restart-btn').addEventListener('click', startNewGame);
document.getElementById('new-username-btn')?.addEventListener('click', updateUsername);
