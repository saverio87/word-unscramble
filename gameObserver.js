import { createReusableFeedbackIcon, animateFeedbackIcon } from "./utils.js";
import { moveLetterBox, showIncorrectLetterFeedback, animateWordCompletion } from "./utils.js";

import { updateWordRowDisplay } from "./utils.js";

export class GameObserver {
    constructor(gameController) {
        this.gameController = gameController;
        this.gameContainer = document.getElementById("gameContainer");
        this.endScreen = document.getElementById("endScreen");
        // Rows containers
        this.definitionContainer = document.getElementById("definitionRow");
        this.topContainer = document.getElementById("topRow");
        this.bottomContainer = document.getElementById("bottomRow");
        this.wordIndicator = document.getElementById("wordIndicator");
        // Recyclable images
        // Create reusable image elements for tick and cross
        this.tickImage = createReusableFeedbackIcon('./tick.png');
        this.crossImage = createReusableFeedbackIcon('./cross.png');
    }

    // This method is called when the gameController changes
    async handleGameEvent(eventType, payload) {
        switch (eventType) {
            case "disableClicks":
                Array.from(this.topContainer.children).forEach((box) => {
                    box.classList.add('not-clickable')
                });
                Array.from(this.bottomContainer.children).forEach((box) => {
                    box.classList.add('not-clickable')
                });
                break;

            case "enableClicks":
                Array.from(this.topContainer.children).forEach((box) => {
                    box.classList.remove('not-clickable')
                });
                Array.from(this.bottomContainer.children).forEach((box) => {
                    box.classList.remove('not-clickable')
                });
                break;
            case "stateChanged":

                // Handling animations before re-rendering word
                const { letterIndex, nextEmptyIndex, sourceRect, targetRect, letterClicked, isCompleted, gameWon } = payload;

                if (letterIndex !== undefined && sourceRect && targetRect && letterClicked) {
                    // Use the new moveLetterBox method instead of separate disappear/appear
                    await this.gameController.notifyListeners('correct');
                    await moveLetterBox(letterClicked, sourceRect, targetRect);
                    console.log("moveLetterBox resolved for:", letterIndex)
                }


                if (isCompleted) {
                    await this.gameController.notifyListeners('wordCompleted');
                    let promise = await animateWordCompletion(this.topContainer);
                    console.log(promise);
                    // Passing render as false, it won't trigger a notifyObserver 'stateChanged'
                    // currentWordIndex = this.gameController.moveToNextWord(false);
                }
                if (gameWon) {
                    this.switchToEndScreen(payload.words);
                    return
                };

                break;

            case "triggerReRendering":
                // Re-render word
                this.reRenderWord(payload.currentWordIndex);
                console.log("Called reRenderWord");
                break;

            case "enterFullScreen":
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                } else if (document.documentElement.webkitRequestFullscreen) { /* Safari */
                    document.documentElement.webkitRequestFullscreen();
                } else if (document.documentElement.msRequestFullscreen) { /* IE11 */
                    document.documentElement.msRequestFullscreen();
                }
                break;

            case "wrongLetter":
                await this.gameController.notifyListeners('incorrect');
                const box = this.bottomContainer.children[payload.letterIndex]
                await showIncorrectLetterFeedback(box)
                // await this.showIncorrectLetterFeedback(payload.letterIndex);
                break;
        }
    }



    checkFullscreen() {
        const overlay = document.getElementById('overlay');
        if (document.fullscreenElement) {
            overlay.classList.add('hidden');
        } else {
            overlay.classList.remove('hidden');
        }
    }



    // animations



    // Re-rendering

    switchToEndScreen(words) {
        // Hide the game container
        this.gameContainer.classList.add("hidden");

        // Show and position the end screen
        this.endScreen.classList.remove("hidden");
        this.endScreen.style.display = "flex";
        this.endScreen.style.flexDirection = "column";
        this.endScreen.style.alignItems = "center";
        this.endScreen.style.width = "100%";
        this.endScreen.style.padding = '2rem';
        // this.endScreen.style.maxWidth = "800px"; // Optional: limit maximum width
        this.endScreen.style.margin = "0 auto";  // Center horizontally

        // Render the end screen content
        this.renderEndScreen(words);

        // this.gameContainer.classList.add("hidden");
        // this.endScreen.classList.remove("hidden");
        // this.displayCompletionScreen(words);
    }

    // Replace the existing renderEndScreen method with this updated version
    renderEndScreen(words) {
        // Create a container for all words
        const wordsContainer = document.createElement("div");
        wordsContainer.classList.add("end-screen-words-container");
        wordsContainer.style.display = "flex";
        wordsContainer.style.flexDirection = "column";
        wordsContainer.style.gap = "1rem";
        wordsContainer.style.marginTop = "2rem"; // Add space below the white container

        // For each word, create a horizontal row of letters
        words.forEach((word, wordIndex) => {
            // Create a container for this word
            const wordContainer = document.createElement("div");
            wordContainer.classList.add("end-screen-word-container");
            wordContainer.style.display = "flex";
            wordContainer.style.flexDirection = "row"; // Horizontal arrangement of letters
            wordContainer.style.justifyContent = "center";
            wordContainer.style.gap = "0.5rem";

            // Add a word label (optional)
            const wordLabel = document.createElement("div");
            wordLabel.classList.add("word-label");
            wordLabel.textContent = `Word ${wordIndex + 1}:`;
            wordLabel.style.marginRight = "1rem";
            wordLabel.style.alignSelf = "center";
            wordContainer.appendChild(wordLabel);

            // Populate the word with letters in a horizontal row
            word.split("").forEach(letter => {
                const box = document.createElement("div");
                box.classList.add("box", "normal", "correct"); // Add classes
                box.textContent = letter; // Set the letter
                wordContainer.appendChild(box); // Add the box to the word container
            });

            // Add this word container to the main words container
            wordsContainer.appendChild(wordContainer);
        });

        // Clear any existing content and append the words container
        this.endScreen.innerHTML = "";

        // Add a heading for the end screen
        const heading = document.createElement("h2");
        heading.textContent = "Congratulations! You completed all words:";
        heading.style.textAlign = "center";
        heading.style.marginBottom = "1.5rem";
        this.endScreen.appendChild(heading);

        // Append the words container to the end screen
        this.endScreen.appendChild(wordsContainer);
    }

    displayCompletionScreen(words) {
        words.forEach((word, wordIndex) => {
            // Create a row for the word
            const row = document.createElement("div");
            row.classList.add("row");
            row.id = `topRow`; // Assign a unique ID for each row

            // Populate the row with letters
            word.split("").forEach(letter => {
                const box = document.createElement("div");
                box.classList.add("box", "normal", "correct"); // Add classes
                box.textContent = letter; // Set the letter
                row.appendChild(box); // Add the box to the row
            });

            // Append the row to the container
            this.endScreen.appendChild(row);
        });
    }

    // Render both the top and bottom rows
    reRenderWord(currentWordIndex) {
        const word = this.gameController.state.words[currentWordIndex];
        console.log(word)
        updateWordRowDisplay(this.definitionContainer, { definitionRow: word.definitionRow });
        updateWordRowDisplay(this.topContainer, { topRow: word.topRow });
        updateWordRowDisplay(this.bottomContainer, { bottomRow: word.bottomRow });
        this.wordIndicator.textContent = `Word ${currentWordIndex + 1} of ${this.gameController.state.words.length}`;
    }



}