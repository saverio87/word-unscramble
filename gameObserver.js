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
        this.gameContainer.classList.add("hidden");
        this.endScreen.classList.remove("hidden");
        this.displayCompletionScreen(words);
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