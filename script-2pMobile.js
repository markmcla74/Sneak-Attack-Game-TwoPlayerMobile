    //The background music was created by Ikoliks, https://pixabay.com/music/meditationspiritual-meditation-music-322801/
    const bgAudio = new Audio("background-track.mp3");
    bgAudio.loop = true;
    bgAudio.volume = 0.1; // so it stays background, not overwhelming
    const gridSize = 6;
    const colors = ["G", "B"];
    const turnIndicator = document.getElementById("turn-indicator");
    let gameOver = false; //flag used to disable movement when game is over
    let grid = [];
    // Movement offsets
    const directions = {
        up: [-1, 0], // up
        left: [0, -1], // left
        down: [1, 0], // down
        right: [0, 1], // right
    };


    // Players
    let players = {
        P1: {
            row: 0,
            col: 0,
            symbol: "●",
            css: "p1",
            camouflaged: false, // new field
            camouflagedColor: null, // remembers what tile color they’re blending into
            glows: 2,
            defaultColor: "black",
            playerColor: "black"
        },
        P2: {
            row: 5,
            col: 5,
            symbol: "●",
            css: "p2",
            camouflaged: false, // new field
            camouflagedColor: null,
            glows: 2,
            defaultColor: "blue",
            playerColor: "blue"
        }
    };

    // Turn tracker
    let currentPlayer = "P1";

    // Generate grid with random colors
    for (let r = 0; r < gridSize; r++) {
        grid[r] = [];
        for (let c = 0; c < gridSize; c++) {
            grid[r][c] = colors[Math.floor(Math.random() * colors.length)];
        }
    }

    // Render grid
    function renderGrid() {
        let html = "";
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                let cellClass = grid[r][c];
                let symbol = "";
                let cssClass = "";
                if ((r === 0 && c === 0) || (r === gridSize - 1 && c === gridSize - 1)) {
                    cellClass += " corner";
                }
                if (r === 0 && c === 2) {
                    cellClass += " door-orange-top"; // top row, glow on bottom edge
                }
                if (r === 5 && c === 2) {
                    cellClass += " door-red-bottom"; // bottom row, glow on top edge
                }
                if (r === 3 && c === 0) {
                    cellClass += " door-blue-left"; // left edge, glow on right side
                }
                if (r === 3 && c === 5) {
                    cellClass += " door-purple-right"; // right edge, glow on left side
                }
                
                if (r === 2 && c === 2) {
                    cellClass += " centerTile-orange"; // top row, glow on bottom edge
                }
                if (r === 2 && c === 3) {
                    cellClass += " centerTile-purple"; // bottom row, glow on top edge
                }
                if (r === 3 && c === 2) {
                    cellClass += " centerTile-blue"; // left edge, glow on right side
                }
                if (r === 3 && c === 3) {
                    cellClass += " centerTile-red"; // right edge, glow on left side
                }
                
                // Players
                if (players.P1.row === r && players.P1.col === c) {
                    symbol = players.P1.symbol;
                    cssClass = players.P1.css;
                    html += `<div id="cell-${r}-${c}" class="cell ${cellClass} ${cssClass}" style="color:${players.P1.playerColor}">${symbol}</div>`;

                } else if (players.P2.row === r && players.P2.col === c) {
                    symbol = players.P2.symbol;
                    cssClass = players.P2.css;
                    html += `<div id="cell-${r}-${c}" class="cell ${cellClass} ${cssClass}" style="color:${players.P2.playerColor}">${symbol}</div>`;
                } else {
                    html += `<div id="cell-${r}-${c}" class="cell ${cellClass} ${cssClass}">${symbol}</div>`;
                }
            }
        }
        document.getElementById("game").innerHTML = html;
        if (currentPlayer === "P1") {
            turnIndicator.textContent = "Player 1's Turn";
            turnIndicator.style.color = "lightgray"; // Player 1 cue
            turnIndicator.style.backgroundColor = "black";
        } else {
            turnIndicator.textContent = "Player 2's Turn";
            turnIndicator.style.color = "lightgray"; // Player 2 cue
            turnIndicator.style.backgroundColor = "blue";
        }

        document.getElementById("p1-glows").textContent = `P1 Glows: ${players.P1.glows}`;
        document.getElementById("p2-glows").textContent = `P2 Glows: ${players.P2.glows}`;
    }

    function resetGame() {
        // Reset players
        players = {
            P1: {
                row: 0,
                col: 0,
                symbol: "●",
                css: "p1",
                camouflaged: false,
                camouflagedColor: null,
                glows: 2,
                playerColor: "black"
            },
            P2: {
                row: 5,
                col: 5,
                symbol: "●",
                css: "p2",
                camouflaged: false,
                camouflagedColor: null,
                glows: 2,
                playerColor: "blue"
            }
        };

        // Reset turn
        currentPlayer = "P1";
        gameOver = false;

        // Reset HUD
        document.getElementById("p1-glows").textContent = `P1 Glows: 2`;
        document.getElementById("p2-glows").textContent = `P2 Glows: 2`;
        document.getElementById("turn-indicator").textContent = "Player 1's Turn";
        document.getElementById("turn-indicator").style.backgroundColor = "black";
        document.getElementById("turn-indicator").style.color = "white";

        // Generate grid with random colors
        for (let r = 0; r < gridSize; r++) {
            grid[r] = [];
            for (let c = 0; c < gridSize; c++) {
                grid[r][c] = colors[Math.floor(Math.random() * colors.length)];
            }
        }
        // Reset grid
        document.getElementById("reset-btn").disabled = true;
        renderGrid();

        // Show overlay again
        document.getElementById("overlay").style.display = "flex";
    }

    renderGrid();
    
    
    
    function processPlayerMove(actionKey){
        if (gameOver) return; // ignore actionKeys if game ended
        let enterDoor = false;
        let player, opponent;
        if (currentPlayer === "P1") {
            player = players.P1;
            opponent = players.P2;
        } else {
            player = players.P2;
            opponent = players.P1;
        }

        // --- Attack Activation ---
        if ((currentPlayer === "P1" && actionKey === "attack") ||
            (currentPlayer === "P2" && actionKey === "attack")) {
            glowAttack(player);
            playVictoryChime();
            let distance = Math.abs(player.row - opponent.row) + Math.abs(player.col - opponent.col);
            if (distance <= 2) {
                // Successful attack
                player.symbol = "●";
                opponent.symbol = "💥";
                document.getElementById("reset-btn").disabled = false;
                gameOver = true;
                renderGrid();
                setTimeout(() => {
                    //console.log(currentPlayer);
                    if (currentPlayer === "P1") {
                        showMessage(`Player 1 wins with a successful attack!`);
                    } else {
                        showMessage(`Player 2 wins with a successful attack!`);
                        //resetGame();
                    }
                }, 50);
            } else {
                // Failed attack → opponent wins
                opponent.symbol = "●";
                player.symbol = "💥";
                document.getElementById("reset-btn").disabled = false;
                gameOver = true;
                renderGrid();
                setTimeout(() => {
                    if (currentPlayer === "P1") {
                        showMessage(`Player 1 missed! Player 2 wins!`);
                    } else showMessage(`Player 2 missed! Player 1 wins!`);
                    // resetGame();
                }, 50);
            }
        }

        // --- Glow opponent Activation ---
        if ((currentPlayer === "P1" && actionKey === "glow") ||
            (currentPlayer === "P2" && actionKey === "glow")) {
            //playChime();
            if (currentPlayer === "P1") {
                playChimeForPlayer("P1");
            } else {
                playChimeForPlayer("P2");
            }

            if (player.glows > 0) {
                player.glows--;

                // Reveal opponent if camouflaged
                if (opponent.camouflaged) {
                    opponent.camouflaged = false;
                    opponent.symbol = "●";
                    glowOpponent(opponent);
                }
                //alert(`${currentPlayer} used a Light Burst! Opponent revealed!`);
            } else {
                //alert(`${currentPlayer} used a Light Burst... but opponent wasn’t hidden.`);
            }

            // End turn
            return;
        } 


        // --- Camouflage actionKeys ---
        if ((currentPlayer === "P1" && actionKey === "camouflage") ||
            (currentPlayer === "P2" && actionKey === "camouflage")) {
            // playChime();
            if (currentPlayer === "P1") {
                playChimeForPlayer("P1");
            } else {
                playChimeForPlayer("P2");
            }
            const camouflagedColor = grid[player.row][player.col];

            player.camouflaged = true;
            player.camouflagedColor = camouflagedColor;
            player.symbol = "";

            // End turn after camouflage
            return; // don’t check movement
        }

        // --- Move Action ---
        if ((currentPlayer === "P1" && actionKey === "up") ||
            (currentPlayer === "P1" && actionKey === "left") ||
            (currentPlayer === "P1" && actionKey === "down") ||
            (currentPlayer === "P1" && actionKey === "right") ||
            (currentPlayer === "P2" && actionKey === "up") ||
            (currentPlayer === "P2" && actionKey === "left") ||
            (currentPlayer === "P2" && actionKey === "down") ||
            (currentPlayer === "P2" && actionKey === "right")) {



            const dir = directions[actionKey];
            let newRow = player.row + dir[0];
            let newCol = player.col + dir[1];
            

            //check blue door at row 3, col 0 for Player 1
            if (currentPlayer === "P1" && player.row === 3 && player.col === 0 && actionKey === "left" && enterDoor === false) {
                playChimeForPlayer("P1");
                newRow = 3;
                newCol = 2;
                enterDoor = true;
            }


            //check blue door at row 3, col 0 for Player 2
            if (currentPlayer === "P2" && player.row === 3 && player.col === 0 && actionKey === "left" && enterDoor === false) {
                playChimeForPlayer("P2");
                newRow = 3;
                newCol = 2;
                enterDoor = true;

            }

            //check purple door at row 3, col 5 for Player 1
            if (currentPlayer === "P1" && player.row === 3 && player.col === 5 && actionKey === "right" && enterDoor === false) {
                playChimeForPlayer("P1");
                newRow = 2;
                newCol = 3;
                enterDoor = true;
            }

            //check purple door at row 3, col 5 for Player 2
            if (currentPlayer === "P2" && player.row === 3 && player.col === 5 && actionKey === "right") {
                playChimeForPlayer("P2");
                newRow = 2;
                newCol = 3;
                enterDoor = true;
            }

            //check orange door at row 0, col 2 for Player 1
            if (currentPlayer === "P1" && player.row === 0 && player.col === 2 && actionKey === "up") {
                playChimeForPlayer("P1");
                newRow = 2;
                newCol = 2;
                enterDoor = true;
            }

            //check orange door at row 0, col 2 for Player 2
            if (currentPlayer === "P2" && player.row === 0 && player.col === 2 && actionKey === "up") {
                playChimeForPlayer("P2");
                newRow = 2;
                newCol = 2;
                enterDoor = true;
            }

            //check red door at row 5, col 2 for Player 1
            if (currentPlayer === "P1" && player.row === 5 && player.col === 2 && actionKey === "down") {
                playChimeForPlayer("P1");
                newRow = 3;
                newCol = 3;
                enterDoor = true;
            }

            //check red door at row 5, col 2 for Player 1
            if (currentPlayer === "P2" && player.row === 5 && player.col === 2 && actionKey === "down") {
                playChimeForPlayer("P2");
                newRow = 3;
                newCol = 3;
                enterDoor = true;
            }

            if (enterDoor === true) {
                player.row = newRow;
                player.col = newCol;


                // If a camouflaged player moves to a tile with a different color, they should no longer be camouflaged, and return to original color
                if (player.camouflaged) {
                    if (grid[player.row][player.col] !== player.camouflagedColor) {
                        // Different color → break camouflage
                        player.camouflaged = false;
                        player.camouflagedColor = null;
                        player.symbol = "●";
                    }
                }

                //check corner win
                // checkCornerWin();
                return;
            }

            // Stay inside grid bounds for all other cases
            if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize && enterDoor === false) {
                //playChime();
                if (currentPlayer === "P1") {
                    playChimeForPlayer("P1");
                } else {
                    playChimeForPlayer("P2");
                }
                player.row = newRow;
                player.col = newCol;


                // If a camouflaged player moves to a tile with a different color, they should no longer be camouflaged, and return to original color
                if (player.camouflaged) {
                    if (grid[player.row][player.col] !== player.camouflagedColor) {
                        // Different color → break camouflage
                        player.camouflaged = false;
                        player.camouflagedColor = null;
                        player.symbol = "●";
                    }
                }

                //check corner win
                checkCornerWin();
                
            }

        }
      
    };

    // Robust interval-based glow that guarantees final color
    function glowOpponent(opponent, duration = 1000) {
        // Defensive: cancel any previous glow for this opponent
        if (opponent._glowInterval) {
            clearInterval(opponent._glowInterval);
            delete opponent._glowInterval;
        }

        const originalColor = opponent.defaultColor || opponent.playerColor || "black";

        const glowColors = [
            "#ffff66", "#fff176", "#ffee58", "#ffeb3b", "#fdd835", "#fbc02d",
            "#f9a825", "#f57f17", "#ff9800", "#fb8c00", "#f57c00", "#ef6c00"
        ];

        const steps = glowColors.length;
        const intervalTime = Math.max(10, Math.round(duration / steps)); // ms per step
        let step = 0;

        // Make sure the opponent is visible before starting the glow
        opponent.symbol = "●";

        // store interval id so we can clear it later if needed
        opponent._glowInterval = setInterval(() => {
            // update playerColor and re-render
            opponent.playerColor = glowColors[step];
            renderGrid();

            step++;

            if (step >= steps) {
                // finished: clear interval and restore original color
                clearInterval(opponent._glowInterval);
                delete opponent._glowInterval;

                // set the logical color back to the original
                opponent.playerColor = originalColor;

                // final render to sync DOM
                renderGrid();

                // Force a browser reflow/repaint and explicitly set the final color on the cell element.
                // This makes the final color stick even if some other small repaint race happens.
                const cellId = `cell-${opponent.row}-${opponent.col}`;
                // Use requestAnimationFrame twice to let browser process the render
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        const cellEl = document.getElementById(cellId);
                        if (cellEl) {
                            // directly set inline style as a last-resort guarantee of appearance
                            cellEl.style.color = originalColor;
                            // if you animate background instead, use:
                            // cellEl.style.backgroundColor = originalColor;
                        }
                    });
                });
            }
        }, intervalTime);
    }

    function glowAttack(attacker) {
        let glowColors = [
            "#ffff66", "#fff176", "#ffee58", "#ffeb3b", "#fdd835", "#fbc02d",
            "#f9a825", "#f57f17", "#ff9800", "#fb8c00", "#f57c00", "#ef6c00"
        ];

        const intervalTime = 1000 / glowColors.length; // 1 second total
        let step = 0;
        //console.log("here");
        //grid[1][1]="purple";
        //document.getElementById('cell-1-1').style.backgroundColor = "purple"; // update display
        // Collect all cells within Manhattan distance 2
        const cellsToGlow = [];
        for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 6; c++) {
                if (Math.abs(attacker.row - r) + Math.abs(attacker.col - c) <= 2) {
                    cellsToGlow.push({
                        row: r,
                        col: c
                    });
                }
            }
        }

        for (let colorIndex = 0; colorIndex < glowColors.length; colorIndex++) {
            setTimeout(function() {
                // inner loop over glowing cells
                for (let i = 0; i < cellsToGlow.length; i++) {
                    const cell = cellsToGlow[i];
                    const cellEl = document.getElementById(`cell-${cell.row}-${cell.col}`);
                    if (cellEl) {
                        cellEl.style.backgroundColor = glowColors[colorIndex];
                        //console.log("Setting color:", glowColors[colorIndex]);
                    }
                }
            }, colorIndex * 200); // delay increases with each color step
        }
    }

    function checkCornerWin() {
        if (players.P1.row === 5 && players.P1.col === 5) {
            showMessage("Player 1 Wins by reaching the corner!");
            players.P2.symbol = "💥"; // explosion for loser
            players.P1.symbol = "●";
            gameOver = true;
            document.getElementById("reset-btn").disabled = false;
            renderGrid();
            playVictoryChime();
            //  bgAudio.pause();
            //         bgAudio.currentTime = 0;
        } else if (players.P2.row === 0 && players.P2.col === 0) {
            showMessage("Player 2 Wins by reaching the corner!");
            players.P2.symbol = "●";
            players.P1.symbol = "💥"; // explosion for loser
            gameOver = true;
            playVictoryChime();
            document.getElementById("reset-btn").disabled = false;
            renderGrid();
        }
    }

    function showMessage(msg) {
        const messageBox = document.createElement("div");
        messageBox.textContent = msg;
        messageBox.style.position = "fixed";
        messageBox.style.top = "40%";
        messageBox.style.left = "50%";
        messageBox.style.transform = "translate(-50%, -50%)";
        messageBox.style.background = "rgba(0,0,0,0.7)";
        messageBox.style.color = "white";
        messageBox.style.padding = "20px 40px";
        messageBox.style.borderRadius = "12px";
        messageBox.style.fontSize = "2rem";
        messageBox.style.zIndex = "1000";
        document.body.appendChild(messageBox);
        setTimeout(() => {
            messageBox.remove(); // <- this deletes the message
        }, 4000);

    }
    
    function showTurnMessage(msg) {
    setTimeout(() => {
        const messageBox = document.createElement("div");
        messageBox.textContent = msg;
        messageBox.style.position = "fixed";
        messageBox.style.top = "5%";
        messageBox.style.left = "50%";
        messageBox.style.transform = "translate(-50%, -50%)";
        messageBox.style.background = "rgba(0,0,0,0.7)";
        messageBox.style.color = "white";
        messageBox.style.padding = "20px 40px";
        messageBox.style.borderRadius = "12px";
        messageBox.style.fontSize = "2rem";
        messageBox.style.zIndex = "1000";

        document.body.appendChild(messageBox);

        setTimeout(() => {
            messageBox.remove(); // remove after visible for 1s
        }, 1000);

    }, 400); // ⏱️ delay before showing
}

    // Define fixed chime frequencies for each player
    const playerChimes = {
        P1: 329.63, // E4
        P2: 392.00 // G4
    };

    function playChimeForPlayer(playerId) {
        const ctx = new(window.AudioContext || window.webkitAudioContext)();

        const freq = playerChimes[playerId]; // fixed tone per player

        // Main oscillator
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);

        osc.connect(gain).connect(ctx.destination);

        // Add a subtle shimmer
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.value = freq * 1.01;
        gain2.gain.setValueAtTime(0.05, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);
        osc2.connect(gain2).connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 2.0);
        osc2.start();
        osc2.stop(ctx.currentTime + 2.0);
    }


    function playChime() {
        const ctx = new(window.AudioContext || window.webkitAudioContext)();

        // Midrange pentatonic (C4–E5 range, no super low tones)
        const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];

        // Pick a random midrange note
        const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];

        // Main oscillator
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);

        osc.connect(gain).connect(ctx.destination);

        // Add subtle richness with a slightly detuned oscillator
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.value = freq * 1.01; // gentle shimmer
        gain2.gain.setValueAtTime(0.05, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);
        osc2.connect(gain2).connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 2.0);
        osc2.start();
        osc2.stop(ctx.currentTime + 2.0);
    }

    function playVictoryChime() {
        // Play 3 chimes spaced 300ms apart
        playChime();
        setTimeout(() => playChime(), 300);
        setTimeout(() => playChime(), 600);
    }
    
    function switchTurns() {
         if (!gameOver) {
                    // Switch turns after a move
                    if (currentPlayer === "P1") {
                        currentPlayer = "P2";
                    } else {
                        currentPlayer = "P1";
                    }

                }
    }

    function handleButtonInput(actionKey, btnEl) {
        if (gameOver) return; // ignore actionKeys if game ended
        processActionKey(actionKey);
        console.log("currentPlayer at handleButtonInput");
        console.log(currentPlayer);
        // Visual feedback
        btnEl.classList.add("pressed");
        setTimeout(() => btnEl.classList.remove("pressed"), 150);
    }
    
    function processActionKey(actionKey){
        if (gameOver) return;
         console.log("START turn:", currentPlayer);
        if (currentPlayer === "P1") {
           turnIndicator.textContent = "Player 1's Turn";
           turnIndicator.style.color = "lightgray"; // Player 1 cue
           turnIndicator.style.backgroundColor = "black";
           //Player 1 acts
           processPlayerMove(actionKey);
           //switchTurns();
          
          //console.log("p1CamouflageTurns",p1CamouflageTurns);
        }
        else {
         turnIndicator.textContent = "Player 2's Turn";
         turnIndicator.style.color = "lightgray"; // Player 2 cue
         turnIndicator.style.backgroundColor = "blue";
         processPlayerMove(actionKey);
         //switchTurns();
        }
      switchTurns(); 
      showTurnMessage(`Move completed. Pass the phone.`);
      renderGrid();
    }
   
    
    document.getElementById("btn-up").addEventListener("click", (e) => handleButtonInput("up", e.target));
    document.getElementById("btn-down").addEventListener("click", (e) => handleButtonInput("down", e.target));
    document.getElementById("btn-left").addEventListener("click", (e) => handleButtonInput("left", e.target));
    document.getElementById("btn-right").addEventListener("click", (e) => handleButtonInput("right", e.target));
    
    // Action buttons
    document.getElementById("btn-camouflage").addEventListener("click", (e) => handleButtonInput("camouflage", e.target));
    document.getElementById("btn-glow").addEventListener("click", (e) => handleButtonInput("glow", e.target));
    document.getElementById("btn-attack").addEventListener("click", (e) => handleButtonInput("attack", e.target));
   
    
    
    
    document.getElementById("begin-btn").addEventListener("click", () => {
        document.getElementById("overlay").style.display = "none";
        // 🎵 Later, you can also start your game music here
        bgAudio.play();
        document.getElementById("reset-btn").addEventListener("click", resetGame);
        renderGrid();
    });
    
    
    
    
