// Génération de nombres aléatoires
function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Génération d'un ticket de loto
function generateLottoTicket() {
    const ticket = [];
    const columns = Array(10).fill(0);

    while (ticket.length < 15) {
        const num = generateRandomNumber(1, 99);
        const column = Math.floor((num - 1) / 10);

        if (!ticket.includes(num) && columns[column] < 3) {
            ticket.push(num);
            columns[column]++;
        }
    }
    return ticket.sort((a, b) => a - b);
}

// Génération de plusieurs tickets
function generateMultipleTickets(numberOfTickets) {
    const tickets = [];
    for (let i = 0; i < numberOfTickets; i++) {
        tickets.push(generateLottoTicket());
    }
    return tickets;
}

// Organisation d'un ticket en grille 3x10
function organizeTicket(ticket) {
    const organizedTicket = Array.from({ length: 3 }, () => Array(10).fill(null));
    const columns = Array(10).fill(0);
    const rows = [0, 0, 0];

    ticket.forEach(num => {
        const column = Math.floor((num - 1) / 10);
        let row = rows.indexOf(Math.min(...rows));

        while (organizedTicket[row][column] !== null) {
            row = (row + 1) % 3;
        }

        organizedTicket[row][column] = num;
        rows[row]++;
    });

    organizedTicket.forEach(row => {
        let numbersInRow = row.filter(num => num !== null).length;
        while (numbersInRow < 5) {
            const emptyColumns = row.map((num, index) => num === null ? index : null).filter(index => index !== null);
            const columnToFill = emptyColumns[Math.floor(Math.random() * emptyColumns.length)];
            const newNum = generateRandomNumber(columnToFill * 10 + 1, columnToFill * 10 + 10);

            if (!ticket.includes(newNum) && !row.includes(newNum)) {
                row[columnToFill] = newNum;
                numbersInRow++;
            }
        }
    });

    return organizedTicket;
}

// Affichage des tickets
function displayTickets(tickets) {
    const ticketsDiv = document.getElementById('tickets');
    ticketsDiv.innerHTML = "";
    
    tickets.forEach((ticket, index) => {
        const ticketDiv = document.createElement('div');
        ticketDiv.className = 'ticket';
        ticketDiv.dataset.ticketIndex = index;
        
        const organizedTicket = organizeTicket(ticket);
        
        organizedTicket.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'ticket-row';
            
            row.forEach(num => {
                const cellDiv = document.createElement('div');
                cellDiv.className = 'ticket-cell';
                if (num !== null) {
                    cellDiv.textContent = num;
                    cellDiv.dataset.value = num;
                } else {
                    cellDiv.classList.add('empty-cell');
                }
                rowDiv.appendChild(cellDiv);
            });
            
            ticketDiv.appendChild(rowDiv);
        });
        
        ticketsDiv.appendChild(ticketDiv);
    });
}

// Génération de la liste des numéros (1-99)
function generateNumbersList() {
    const numbers = [];
    for (let i = 1; i <= 99; i++) {
        numbers.push(i);
    }
    return numbers;
}

// Mélange d'un tableau
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Variables globales
let items = generateNumbersList();
let drawInterval;
let gameActive = false;

// Tirage d'un numéro
function drawItem() {
    if (items.length > 0 && gameActive) {
        shuffleArray(items);
        const drawnItem = items.pop();

        const resultLi = document.createElement('li');
        resultLi.textContent = drawnItem;
        document.getElementById('results').appendChild(resultLi);

        highlightTickets(drawnItem);
    } else {
        stopDraw();
    }
}

// Mise en évidence des numéros tirés sur les tickets
function highlightTickets(drawnNumber) {
    const ticketCells = document.querySelectorAll('.ticket-cell');

    ticketCells.forEach(cell => {
        if (parseInt(cell.dataset.value) === drawnNumber) {
            cell.classList.add('highlight');
        }
    });

    checkWinningTickets();
}

// Vérification des tickets gagnants
function checkWinningTickets() {
    const tickets = document.querySelectorAll('.ticket');

    tickets.forEach(ticket => {
        const rows = ticket.querySelectorAll('.ticket-row');
        let hasWinningLine = false;

        rows.forEach(row => {
            const cells = row.querySelectorAll('.ticket-cell:not(.empty-cell)');
            const highlightedCells = row.querySelectorAll('.ticket-cell.highlight').length;
            
            if (cells.length === 5 && highlightedCells === 5) {
                hasWinningLine = true;
            }
        });

        if (hasWinningLine && !ticket.classList.contains('winner')) {
            ticket.classList.add('winner');
            gameActive = false;
            stopDraw();
            
            setTimeout(() => {
                alert("🎉 Félicitations ! Un ticket a gagné !");
            }, 500);
        }
    });
}

// Démarrage du tirage
function startDraw() {
    if (document.querySelectorAll('.ticket').length === 0) {
        alert("Veuillez d'abord générer des tickets !");
        return;
    }

    if (gameActive) {
        return;
    }

    gameActive = true;
    const startBtn = document.getElementById('startDrawBtn');
    startBtn.disabled = true;
    startBtn.textContent = "Tirage en cours...";
    
    drawInterval = setInterval(drawItem, 300);
}

// Arrêt du tirage
function stopDraw() {
    clearInterval(drawInterval);
    gameActive = false;
    const startBtn = document.getElementById('startDrawBtn');
    startBtn.disabled = false;
    startBtn.textContent = "Lancer le tirage";
}

// Réinitialisation du jeu
function resetGame() {
    items = generateNumbersList();
    stopDraw();
    
    document.getElementById('results').innerHTML = "";
    document.getElementById('tickets').innerHTML = "";
    
    gameActive = false;
}

// Événements
document.getElementById('generateBtn').addEventListener('click', () => {
    const numberOfTickets = parseInt(document.getElementById('ticketNumberInput').value) || 5;
    
    if (numberOfTickets < 1 || numberOfTickets > 20) {
        alert("Veuillez entrer un nombre entre 1 et 20");
        return;
    }
    
    resetGame();
    const tickets = generateMultipleTickets(numberOfTickets);
    displayTickets(tickets);
});

document.getElementById('startDrawBtn').addEventListener('click', startDraw);
document.getElementById('resetBtn').addEventListener('click', resetGame);
