function generateUsername() {
    const uuid = crypto.randomUUID();
    const shortId = uuid.slice(0, 8);
    return `player_${shortId}`;
}

class Game2048 {
    constructor(size = 4) {
        this.size = size;
        this.grid = [];
        this.score = 0;
        this.gameOver = false;
        this.username = generateUsername();
        this.initialize();
    }

    initialize() {
        // Create empty grid
        for (let i = 0; i < this.size; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.size; j++) {
                this.grid[i][j] = 0;
            }
        }
        // Add initial tiles
        this.addRandomTile();
        this.addRandomTile();
    }

    addRandomTile() {
        const availableCells = [];
        
        // Find all empty cells
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    availableCells.push({ x: i, y: j });
                }
            }
        }

        if (availableCells.length > 0) {
            const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
            this.grid[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    move(direction) {
        let moved = false;

        switch (direction) {
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
        }

        if (moved) {
            this.addRandomTile();
            this.checkGameOver();
        }

        return moved;
    }

    moveLeft() {
        let moved = false;
        
        for (let i = 0; i < this.size; i++) {
            let row = this.grid[i].filter(cell => cell !== 0);
            
            // Merge tiles
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j + 1, 1);
                    moved = true;
                }
            }

            // Fill with zeros
            while (row.length < this.size) {
                row.push(0);
            }

            if (JSON.stringify(this.grid[i]) !== JSON.stringify(row)) {
                moved = true;
            }
            this.grid[i] = row;
        }

        return moved;
    }

    moveRight() {
        let moved = false;
        
        for (let i = 0; i < this.size; i++) {
            let row = this.grid[i].filter(cell => cell !== 0);
            
            // Merge tiles
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j - 1, 1);
                    moved = true;
                }
            }

            // Fill with zeros
            while (row.length < this.size) {
                row.unshift(0);
            }

            if (JSON.stringify(this.grid[i]) !== JSON.stringify(row)) {
                moved = true;
            }
            this.grid[i] = row;
        }

        return moved;
    }

    moveUp() {
        let moved = false;
        
        for (let j = 0; j < this.size; j++) {
            let column = [];
            for (let i = 0; i < this.size; i++) {
                column.push(this.grid[i][j]);
            }
            
            column = column.filter(cell => cell !== 0);
            
            // Merge tiles
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i + 1, 1);
                    moved = true;
                }
            }

            // Fill with zeros
            while (column.length < this.size) {
                column.push(0);
            }

            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== column[i]) {
                    moved = true;
                }
                this.grid[i][j] = column[i];
            }
        }

        return moved;
    }

    moveDown() {
        let moved = false;
        
        for (let j = 0; j < this.size; j++) {
            let column = [];
            for (let i = 0; i < this.size; i++) {
                column.push(this.grid[i][j]);
            }
            
            column = column.filter(cell => cell !== 0);
            
            // Merge tiles
            for (let i = column.length - 1; i > 0; i--) {
                if (column[i] === column[i - 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i - 1, 1);
                    moved = true;
                }
            }

            // Fill with zeros
            while (column.length < this.size) {
                column.unshift(0);
            }

            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== column[i]) {
                    moved = true;
                }
                this.grid[i][j] = column[i];
            }
        }

        return moved;
    }

    checkGameOver() {
        // Check if there are any empty cells
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    return;
                }
            }
        }

        // Check if any adjacent cells have the same value
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (
                    (i < this.size - 1 && this.grid[i][j] === this.grid[i + 1][j]) ||
                    (j < this.size - 1 && this.grid[i][j] === this.grid[i][j + 1])
                ) {
                    return;
                }
            }
        }

        this.gameOver = true;
    }

    handleKeyPress(event) {
        if (this.gameOver) return;

        switch (event.key) {
            case 'ArrowLeft':
                this.move('left');
                break;
            case 'ArrowRight':
                this.move('right');
                break;
            case 'ArrowUp':
                this.move('up');
                break;
            case 'ArrowDown':
                this.move('down');
                break;
        }
    }

    getGrid() {
        return this.grid;
    }

    getScore() {
        return this.score;
    }

    getUsername() {
        return this.username;
    }

    isGameOver() {
        return this.gameOver;
    }

    restart() {
        this.grid = [];
        this.score = 0;
        this.gameOver = false;
        this.username = generateUsername();
        this.initialize();
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
    const score = game.getScore();
    const username = game.getUsername();
    
    // Update username display
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        usernameElement.textContent = username;
    }
    
    // Update score display
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = score;
    }

    // Update grid display
    const gridContainer = document.querySelector('.grid-container');
    if (gridContainer) {
        gridContainer.innerHTML = ''; // Clear existing grid

        // Create and update grid cells
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                
                if (grid[i][j] !== 0) {
                    cell.textContent = grid[i][j];
                    cell.classList.add(`tile-${grid[i][j]}`);
                }
                
                gridContainer.appendChild(cell);
            }
        }
    }

    // Update game over message
    const gameOverElement = document.getElementById('game-over');
    if (gameOverElement) {
        gameOverElement.style.display = game.isGameOver() ? 'block' : 'none';
    }
}

// Initialize the game and update UI
const game = new Game2048();
updateUI();

// Add event listeners
document.addEventListener('keydown', (event) => {
    game.handleKeyPress(event);
    updateUI();
});

document.getElementById('new-game-btn').addEventListener('click', startNewGame);
document.getElementById('restart-btn').addEventListener('click', startNewGame);
document.getElementById('new-username-btn')?.addEventListener('click', updateUsername);
