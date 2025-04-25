import { GameObserver } from "./gameObserver.js";
import { SoundManager, SoundObserver } from "./sound/sound.js";
import { checkWordCompletion, checkGameCompletion } from "./utils.js";


class GameController {
    constructor() {
        this.state = { words: [], currentWordIndex: 0 };
        this.observers = [];
        this.listeners = [];
    }
    // Add observer to the list
    addObserver(observer) {
        this.observers.push(observer);
    }
    addListener(listener) {
        this.listeners.push(listener);
    }

    async notifyObservers(eventType, payload) {
        // Notify all observers about the event and collect their Promises
        const promises = this.observers.map(observer => observer.handleGameEvent(eventType, payload));
        try {
            await Promise.all(promises);
            console.log(`✅ All observers resolved for event: ${eventType}`);
        } catch (error) {
            console.error(`❌ Observer error for event: ${eventType}`, error);
        }
    }


    async notifyListeners(eventType) {
        console.log('notifyListeners activated')
        // Notify all observers about the event and collect their Promises
        const promises = this.listeners.map(listener => listener.update(eventType));
        try {
            await Promise.all(promises);
            console.log(`✅ All listeners resolved for event: ${eventType}`);
        } catch (error) {
            console.error(`❌ Listener error for event: ${eventType}`, error);
        }

    }

    // Generate word objects for the game state
    initializeGameWords(words) {
        const wordsObject = words.map(word => ({
            word: word.word,  // The original word
            scrambled: word.word.split("").sort(() => Math.random() - 0.5), // Scrambled word
            definitionRow: word.definition,
            topRow: Array(word.word.length).fill(""), // Empty progress in the top row
            bottomRow: word.word.split("").sort(() => Math.random() - 0.5), // Scrambled letters
            completed: false // Flag to check if the word is completed
        }));

        this.state.words = wordsObject
    }

    extractWordList() {
        let container = []
        this.state.words.forEach((word) => {
            container.push(word.word)
        })
        return container
    }

    // move to next or previous word

    navigateToNextWord(render) {
        console.log('moving to next word')
        if (this.state.currentWordIndex < this.state.words.length - 1) {
            this.state.currentWordIndex++;
            if (render) {
                this.notifyObservers("triggerReRendering", {
                    currentWordIndex: this.state.currentWordIndex
                });
                return
            }
            return this.state.currentWordIndex;
        }
    }

    navigateToPreviousWord() {
        if (this.state.currentWordIndex > 0) {
            this.state.currentWordIndex--;
            this.notifyObservers("triggerReRendering", {
                currentWordIndex: this.state.currentWordIndex
            });
        }
    }

    // Utility function to introduce a delay (pause)

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Click events

    // Handle click events when a letter is selected
    async handleClick(currentWordIndex, letterClicked, letterIndex) {
        const word = this.state.words[currentWordIndex];
        const nextEmptyIndex = word.topRow.findIndex(c => c === "");

        if (
            nextEmptyIndex !== -1 // if there is an empty index left
            && letterClicked === word.word[nextEmptyIndex] //
        ) {
            // Get positions for animation before updating state
            const sourceElement = document.querySelector(`#bottomRow .box:nth-child(${letterIndex + 1})`);
            const targetElement = document.querySelector(`#topRow .box:nth-child(${nextEmptyIndex + 1})`);

            if (sourceElement && targetElement) {
                const sourceRect = sourceElement.getBoundingClientRect();
                const targetRect = targetElement.getBoundingClientRect();

                // Update state
                word.topRow[nextEmptyIndex] = letterClicked; // Place letter in topRow
                word.bottomRow[letterIndex] = ""; // Remove letter from bottomRow

                // 1. Disable clicks, 2. move letter box, 3. trigger re-rendering, 4. re-enable clicks
                this.notifyObservers("disableClicks", {});
                // Notify observers with position data for animation
                await this.notifyObservers("stateChanged", {
                    letterIndex,
                    nextEmptyIndex,
                    sourceRect,
                    targetRect,
                    letterClicked
                });
                await this.notifyObservers("triggerReRendering", { currentWordIndex });
                this.notifyObservers("enableClicks", {});

                // Check for word completion
                if (checkWordCompletion(word)) {
                    await this.notifyObservers("stateChanged", {
                        isCompleted: true,
                        // isDelayed: 1000
                    });
                    word.completed = true;
                    currentWordIndex = this.navigateToNextWord(false);
                    await this.notifyObservers("triggerReRendering", { currentWordIndex })

                }

                // Check for game completion
                if (checkGameCompletion(this.state.words)) {
                    let words = this.extractWordList();
                    await this.notifyObservers('stateChanged', {
                        isDelayed: 1000,
                        gameWon: true,
                        words
                    })
                }

            }


        } else {
            this.notifyObservers("disableClicks", {});
            await this.notifyObservers("wrongLetter", { letterIndex });
            this.notifyObservers("enableClicks", {});
        }
    }


}


// ---------------------------------------


document.addEventListener("DOMContentLoaded", () => {

    const words = JSON.parse(localStorage.getItem("words"));

    // Initialize the game state and observer and add observer to the game state
    const gameController = new GameController();
    const gameObserver = new GameObserver(gameController);
    // Init sound
    const soundManager = new SoundManager();
    const soundObserver = new SoundObserver(soundManager);
    // add observer and listener
    gameController.addObserver(gameObserver);
    gameController.addListener(soundObserver);

    // Full screen
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    fullscreenBtn.addEventListener('click', () => {
        gameController.notifyObservers("enterFullScreen", null);
    })
    document.addEventListener('fullscreenchange', () => {
        gameObserver.checkFullscreen()
    });
    window.addEventListener('resize', () => {
        gameObserver.checkFullscreen()
    });


    // Starting game - Generate word objects for the game state
    gameController.initializeGameWords(words);
    gameController.notifyObservers("triggerReRendering", { currentWordIndex: gameController.state.currentWordIndex });

    // ARROW NAVIGATION - Event listeners
    const prevArrow = document.getElementById("prevArrow");
    const nextArrow = document.getElementById("nextArrow");

    prevArrow.addEventListener("click", () => {
        gameController.navigateToPreviousWord();
    });
    nextArrow.addEventListener("click", () => {
        gameController.navigateToNextWord(true);
    });

    // Add event listeners for bottom row letters
    gameObserver.bottomContainer.addEventListener("click", (event) => {
        const box = event.target.closest(".box");
        if (box) {
            const letterIndex = Array.from(gameObserver.bottomContainer.children).indexOf(box);
            const letterClicked = box.textContent;
            gameController.handleClick(gameController.state.currentWordIndex, letterClicked, letterIndex);
        }
    });
});
