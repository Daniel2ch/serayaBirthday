// Wait until the HTML page is fully loaded before running our script
document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================
    // --- 1. DOM ELEMENTS SELECTION ---
    // ==========================================================
    
    // Elements for Home Screen & Memory Card Game (Game 1)
    const playButton = document.getElementById('play-button');
    const homeScreen = document.getElementById('home-screen');
    const gameScreen = document.getElementById('game-screen');
    const gameGrid = document.getElementById('game-grid');
    const moveCountEl = document.getElementById('move-count');
    const matchCountEl = document.getElementById('match-count');
    const victoryScreen = document.getElementById('victory-screen');
    const finalMovesEl = document.getElementById('final-moves');
    const nextGameBtn = document.getElementById('next-game-btn');
    const restartGameBtn = document.getElementById('restart-game-btn');
    const finalPhotosContainer = document.querySelector('.FinalPhotos'); 
    const finalPhotoElements = document.querySelectorAll('.FinalPhoto'); 

    // Elements for Trivia Quiz Screen (Game 2)
    const quizScreen = document.getElementById('quiz-screen');
    const quizProgressText = document.getElementById('quiz-progress-text');
    const quizQuestionText = document.getElementById('quiz-question-text');
    const quizOptionsContainer = document.getElementById('quiz-options-container');
    const quizFeedback = document.getElementById('quiz-feedback');
    const quizVictory = document.getElementById('quiz-victory');
    const restartQuizBtn = document.getElementById('restart-quiz-btn');
    const startPuzzleBtn = document.getElementById('start-puzzle-btn');

    const puzzleScreen = document.getElementById('puzzle-screen');
    const puzzleBoard = document.getElementById('puzzle-board');
    const puzzlePiecesContainer = document.getElementById('puzzle-pieces');
    const puzzleRoundText = document.getElementById('puzzle-round-text');
    const puzzleFeedbackText = document.getElementById('puzzle-feedback');
    const restartPuzzleBtn = document.getElementById('restart-puzzle-btn');
    const puzzleVictory = document.getElementById('puzzle-victory');
    const nextPuzzleRoundBtn = document.getElementById('next-puzzle-round-btn');
    const finishPuzzleBtn = document.getElementById('finish-puzzle-btn');

    // ==========================================================
    // --- 2. GAME DECK DEFINITION (MEMORY GAME) ---
    // ==========================================================
    
    // We define 8 unique card items (local photos) to form 8 matching pairs.
    const cardsArray = [
        { type: 'image', value: '/images/Photo1.jpg' },
        { type: 'image', value: '/images/Photo2.jpg' },
        { type: 'image', value: '/images/Photo3.jpg' },
        { type: 'image', value: '/images/Photo4.jpg' },
        { type: 'image', value: '/images/Photo5.jpg' },
        { type: 'image', value: '/images/Photo6.jpg' },
        { type: 'image', value: '/images/Photo7.jpg' },
        { type: 'image', value: '/images/Photo8.jpg' },
    ];

    // Double the array so we have 2 of each card (making 16 cards total / 8 pairs).
    let cardData = [...cardsArray, ...cardsArray];

    // ==========================================================
    // --- 3. STATE VARIABLES (MEMORY GAME) ---
    // ==========================================================
    let moves = 0;             // Counts how many turns the player has taken
    let matches = 0;           // Counts how many pairs have been successfully matched
    let flippedCards = [];     // Temporary list to hold the two cards currently turned face up
    let lockBoard = false;     // Prevents clicking more cards during checks

    // ==========================================================
    // --- 4. GAME EVENT LISTENERS ---
    // ==========================================================
    
    // Click "Let's play!" to hide home screen and start the memory game
    playButton.addEventListener('click', () => {
        homeScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        initGame();
    });

    // Play again button on the memory game victory overlay
    restartGameBtn.addEventListener('click', () => {
        initGame();
    });

    // Transition from Memory Game victory screen to Quiz Game
    nextGameBtn.addEventListener('click', () => {
        victoryScreen.classList.add('hidden'); // Hide the memory win overlay
        gameScreen.classList.add('hidden');    // Hide the memory grid screen
        quizScreen.classList.remove('hidden'); // Show the quiz screen
        initQuiz();                            // Initialize the quiz
    });

    // Restart quiz button on the quiz victory screen
    restartQuizBtn.addEventListener('click', () => {
        initQuiz();
    });

    startPuzzleBtn.addEventListener('click', () => {
        quizVictory.classList.add('hidden');
        quizScreen.classList.add('hidden');
        puzzleScreen.classList.remove('hidden');
        initPuzzle(0);
    });

    restartPuzzleBtn.addEventListener('click', () => initPuzzle(currentPuzzleRound));
    nextPuzzleRoundBtn.addEventListener('click', () => initPuzzle(currentPuzzleRound + 1));
    finishPuzzleBtn.addEventListener('click', handleFinishPuzzleClick);

    // ==========================================================
    // --- 5. MEMORY CARD GAME LOGIC ---
    // ==========================================================

    // Initialize or Reset the Grid
    function initGame() {
        moves = 0;
        matches = 0;
        flippedCards = [];
        lockBoard = false;
        
        moveCountEl.textContent = '0';
        matchCountEl.textContent = '0';
        victoryScreen.classList.add('hidden');
        gameGrid.innerHTML = '';

        // Shuffle cards
        const shuffledCards = shuffle([...cardData]);

        // Dynamically build card HTML nodes
        shuffledCards.forEach(cardInfo => {
            const cardEl = document.createElement('div');
            cardEl.classList.add('card');
            cardEl.dataset.value = cardInfo.value;

            const inner = document.createElement('div');
            inner.classList.add('card-inner');

            const front = document.createElement('div');
            front.classList.add('card-front');

            const back = document.createElement('div');
            back.classList.add('card-back');

            const img = document.createElement('img');
            img.src = cardInfo.value;
            img.alt = 'Memory Photo';
            back.appendChild(img);

            inner.appendChild(front);
            inner.appendChild(back);
            cardEl.appendChild(inner);

            cardEl.addEventListener('click', () => handleCardClick(cardEl));
            gameGrid.appendChild(cardEl);
        });
    }

    // Handles card selection clicks
    function handleCardClick(clickedCard) {
        if (lockBoard) return;
        if (clickedCard.classList.contains('flipped') || clickedCard.classList.contains('matched')) return;

        clickedCard.classList.add('flipped');
        flippedCards.push(clickedCard);

        if (flippedCards.length === 2) {
            moves++;
            moveCountEl.textContent = moves;
            checkMatch();
        }
    }

    // Compares the two flipped cards
    function checkMatch() {
        const [card1, card2] = flippedCards;
        const isMatch = card1.dataset.value === card2.dataset.value;

        if (isMatch) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            matches++;
            matchCountEl.textContent = matches;
            flippedCards = [];
            checkWin();
        } else {
            lockBoard = true;
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
                lockBoard = false;
            }, 1000);
        }
    }

    // Verifies if all 8 memory pairs are matched
    function checkWin() {
        if (matches === 8) {
            setTimeout(() => {
                victoryScreen.classList.remove('hidden');
                finalMovesEl.textContent = moves;
                triggerConfetti('#victory-screen .victory-content'); // Trigger confetti shower
            }, 800);
        }
    }

    // ==========================================================
    // --- 6. TRIVIA QUIZ LOGIC (GAME 2) ---
    // ==========================================================

    // The list of 8 questions.
    const quizQuestions = [
        {
            question: "Daniel favorite feature of Seraya?",
            options: ["Eyes", "Dimples", "Smile", "Cake and Cherries"],
            allCorrect: true  // Special flag: ALL options must be clicked to complete this question
        },
        {
            question: "What is known to be our song?",
            options: ["Tiroteo", "Todo de ti", "Aquel Nap ZzZz", "Dile a El"],
            answerIndex: 0
        },
        {
            question: "Where was our first hike?",
            options: ["Lake Serene", "Lewis River Falls", "Tomlike Mountain", "El Yunque National Forest"],
            answerIndex: 1
        },
        {
            question: "How did we get our first kiss?",
            options: ["During first date", "Chiawana Park", "With French Fry", "Before Rauw Concert"],
            answerIndex: 2
        },
        {
            question: "What did Seraya get Daniel for first christmas gift?",
            options: ["JSN Jersey", "TV", "Soccer Shoes", "Bad Bunny Crocs"],
            answerIndex: 3
        },
        {
            question: "What was Daniel's first gift to Seraya?",
            options: ["Coach Purse", "Kodak Camera", "PS5", "Legos"],
            answerIndex: 0
        },
        {
            question: "When did i ask you to be my girlfriend?",
            options: ["June 9th, 2023", "August 9th 2023", "August 19th 2023", "June 19th 2023"],
            answerIndex: 1
        },
        {
            question: "How much do I love Seraya?",
            options: ["A little", "To the moon and back x10000000", "Actually hate you", "Not at all"],
            answerIndex: 1
        }
    ];

    let currentQuestionIndex = 0; // Tracks which question is active
    let quizLock = false;          // Prevents multiple rapid clicks while showing answer feedback
    let clickedOptions = [];       // Tracks which option indices have been clicked (used for allCorrect questions)

    const puzzleImages = ['/images/Game3Photo.jpg', '/images/Game3Photo2.jpg'];
    let currentPuzzleRound = 0;
    let selectedPuzzlePiece = null;
    let placedPieces = 0;

    // Reset and start the quiz
    function initQuiz() {
        currentQuestionIndex = 0;
        quizVictory.classList.add('hidden');
        quizFeedback.classList.add('hidden');
        quizLock = false;
        clickedOptions = [];  // Reset the tracker
        showQuestion();
    }

    // Render the active question card and generate option buttons
    function showQuestion() {
        // Reset feedback container
        quizFeedback.classList.add('hidden');
        quizFeedback.className = 'quiz-feedback hidden';
        quizOptionsContainer.innerHTML = '';

        const currentQ = quizQuestions[currentQuestionIndex];

        // Update question progress text
        quizProgressText.textContent = `Question ${currentQuestionIndex + 1} of 8`;
        
        // Update question text heading
        quizQuestionText.textContent = currentQ.question;

        // Create a button for each answer choice option
        currentQ.options.forEach((optionText, index) => {
            const btn = document.createElement('button');
            btn.classList.add('quiz-option-btn');
            btn.textContent = optionText;

            // Check correctness when the button is clicked
            btn.addEventListener('click', () => handleOptionClick(index, btn));
            
            quizOptionsContainer.appendChild(btn);
        });
    }

    // Processes option selection
    function handleOptionClick(selectedIndex, clickedBtn) {
        if (quizLock) return;

        const currentQ = quizQuestions[currentQuestionIndex];

        // --- SPECIAL CASE: "allCorrect" questions ---
        // For these questions, every option is correct. The player must click all of them.
        // Once all 4 are clicked
        if (currentQ.allCorrect) {
            // If this option was already clicked, ignore it
            if (clickedOptions.includes(selectedIndex)) return;

            // Mark option as clicked and highlight it green
            clickedOptions.push(selectedIndex);
            clickedBtn.classList.add('correct');

            // Check if all options have been clicked
            if (clickedOptions.length === currentQ.options.length) {
                quizLock = true;
                // Inject the text and the GIF dynamically for Question 1
                if (currentQuestionIndex === 0) {
                    quizFeedback.innerHTML = `
                        <div style="margin-bottom: 10px;">All of them of course dummy!</div>
                        <img src="/images/DespicableMeFlirting.gif" alt="Flirting GIF" style="max-width: 200px; border-radius: 10px;">
                    `;
                } else {
                    quizFeedback.textContent = "All of them of course dummy!";
                }
                
                quizFeedback.className = "quiz-feedback correct-text";

                // Advance to next question after a short pause
                setTimeout(() => {
                    clickedOptions = [];
                    currentQuestionIndex++;
                    if (currentQuestionIndex < quizQuestions.length) {
                        showQuestion();
                    } else {
                        showQuizVictory();
                    }
                    quizLock = false;
                }, 5000); // 5 seconds so they can read the message
            }
            return; // Exit early — don't run normal correct/incorrect logic
        }

        // --- NORMAL QUESTIONS ---
        const isCorrect = selectedIndex === currentQ.answerIndex;

        quizLock = true; // Lock interactions

        if (isCorrect) {
            // Apply green success visual styles
            clickedBtn.classList.add('correct');
            
            // Use innerHTML to display the text and the success GIF
            quizFeedback.innerHTML = `
                <div style="margin-bottom: 10px;">Correct! Yayyyyy 🥰</div>
                <img src="/images/HappyGrogu.gif" alt="HappyGorgu" style="max-width: 200px; border-radius: 10px;">
            `;
            
            quizFeedback.className = "quiz-feedback correct-text";

            // Wait 5 seconds, then advance to next question
            setTimeout(() => {
                currentQuestionIndex++;
                if (currentQuestionIndex < quizQuestions.length) {
                    showQuestion();
                } else {
                    showQuizVictory();
                }
                quizLock = false; // Unlock
            }, 5000);

        } else {
            // Apply red error visual styles
            clickedBtn.classList.add('incorrect');
            
            // Use innerHTML to display the custom message and your GIF
            quizFeedback.innerHTML = `
                <div style="margin-bottom: 10px;">Really?</div>
                <img src="/images/SadGrogu.gif" alt="SadGrogu" style="max-width: 200px; border-radius: 10px;">
            `;
            
            quizFeedback.className = "quiz-feedback incorrect-text";

            // Wait 5 seconds, then restore button state so player can select another option
            setTimeout(() => {
                clickedBtn.classList.remove('incorrect');
                quizFeedback.classList.add('hidden');
                quizLock = false; // Unlock
            }, 5000);
        }
    }

    // Triggers the final complete screen
    function showQuizVictory() {
        quizVictory.classList.remove('hidden');
    }

    function initPuzzle(roundIndex = 0) {
        currentPuzzleRound = Math.min(Math.max(roundIndex, 0), puzzleImages.length - 1);
        placedPieces = 0;
        selectedPuzzlePiece = null;

        puzzleVictory.classList.add('hidden');
        puzzleRoundText.textContent = `Round ${currentPuzzleRound + 1} of ${puzzleImages.length}`;
        puzzleFeedbackText.textContent = 'Select a piece then place it into the board.';
        puzzleBoard.innerHTML = '';
        puzzlePiecesContainer.innerHTML = '';

        const pieceOrder = Array.from({ length: 10 }, (_, index) => index);
        const shuffledPieces = shuffle([...pieceOrder]);

        pieceOrder.forEach(index => {
            const slot = document.createElement('div');
            slot.classList.add('puzzle-slot');
            slot.dataset.slotIndex = index;
            slot.addEventListener('click', () => handlePuzzleSlotClick(slot));
            puzzleBoard.appendChild(slot);
        });

        shuffledPieces.forEach(index => {
            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.dataset.pieceIndex = index;
            setPuzzlePieceStyle(piece, index);
            piece.addEventListener('click', () => selectPuzzlePiece(piece));
            puzzlePiecesContainer.appendChild(piece);
        });
    }

    function setPuzzlePieceStyle(pieceEl, pieceIndex) {
        const row = Math.floor(pieceIndex / 5);
        const col = pieceIndex % 5;
        pieceEl.style.backgroundImage = `url("${puzzleImages[currentPuzzleRound]}")`;
        pieceEl.style.backgroundPosition = `${-col * 120}px ${-row * 120}px`;
    }

    function selectPuzzlePiece(pieceEl) {
        if (pieceEl.classList.contains('placed')) return;

        if (selectedPuzzlePiece === pieceEl) {
            selectedPuzzlePiece.classList.remove('selected');
            selectedPuzzlePiece = null;
            puzzleFeedbackText.textContent = 'Select a piece then place it into the board.';
            return;
        }

        if (selectedPuzzlePiece) {
            selectedPuzzlePiece.classList.remove('selected');
        }

        selectedPuzzlePiece = pieceEl;
        selectedPuzzlePiece.classList.add('selected');
        puzzleFeedbackText.textContent = 'Now click the spot where that piece belongs.';
    }

    function handlePuzzleSlotClick(slotEl) {
        if (!selectedPuzzlePiece) {
            puzzleFeedbackText.textContent = 'First choose a piece from below.';
            return;
        }

        if (slotEl.classList.contains('correct')) {
            return;
        }

        const pieceIndex = Number(selectedPuzzlePiece.dataset.pieceIndex);
        const slotIndex = Number(slotEl.dataset.slotIndex);

        if (pieceIndex === slotIndex) {
            slotEl.classList.add('correct');
            selectedPuzzlePiece.classList.add('placed');
            selectedPuzzlePiece.classList.remove('selected');
            slotEl.appendChild(selectedPuzzlePiece);
            selectedPuzzlePiece = null;
            placedPieces += 1;
            puzzleFeedbackText.textContent = `Great! ${placedPieces} of 10 pieces in place.`;

            if (placedPieces === 10) {
                showPuzzleVictory();
            }
            return;
        }

        slotEl.classList.add('wrong');
        puzzleFeedbackText.textContent = 'That piece does not fit there. Try again.';
        setTimeout(() => slotEl.classList.remove('wrong'), 300);
    }

    function showPuzzleVictory() {
        const completedRound = currentPuzzleRound + 1;
        document.getElementById('completed-puzzle-round').textContent = completedRound;
        puzzleVictory.classList.remove('hidden');

        const isLastRound = currentPuzzleRound === puzzleImages.length - 1;
        if (isLastRound) {
            nextPuzzleRoundBtn.style.display = 'none';
            finishPuzzleBtn.textContent = 'Finish';
            finishPuzzleBtn.dataset.finalRound = 'true';
        } else {
            nextPuzzleRoundBtn.style.display = 'inline-block';
            finishPuzzleBtn.textContent = 'Back Home';
            finishPuzzleBtn.dataset.finalRound = 'false';
        }
    }

    function handleFinishPuzzleClick() {
        puzzleVictory.classList.add('hidden');

        const isFinalRound = finishPuzzleBtn.dataset.finalRound === 'true';
        if (isFinalRound) {
            clearScreensKeepBackground();
            return;
        }

        puzzleScreen.classList.add('hidden');
        homeScreen.classList.remove('hidden');
    }

    function clearScreensKeepBackground() {
        homeScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        quizScreen.classList.add('hidden');
        puzzleScreen.classList.add('hidden');
        victoryScreen.classList.add('hidden');
        quizVictory.classList.add('hidden');
        puzzleVictory.classList.add('hidden');
        finalPhotosContainer.classList.remove('hidden');
        finalPhotosContainer.classList.add('falling-photos-grid'); 

        // Unhide all 8 individual photos
        finalPhotoElements.forEach(photo => photo.classList.remove('hidden'));

        // Keep falling-container visible so only the animated background remains.
    }

    // Fisher-Yates Shuffling Algorithm
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});
