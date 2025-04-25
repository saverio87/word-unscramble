

// Logic - condition checking

export function checkWordCompletion(word) {
    // evaluates to true / false
    return word.topRow.join("") == word.word
}

export function checkGameCompletion(words) {
    for (let word of words) {
        if (!word.completed) return false
    }
    return true; // Indicate that the game is won
}


// create images 

export function createFeedbackIcon(src) {
    const img = document.createElement("img");
    img.src = src;
    img.classList.add('img');
    return img;
}

export function createReusableFeedbackIcon(src) {
    const img = document.createElement("img");
    img.classList.add('img')
    img.src = src;
    img.style.position = "absolute"; // Optional for positioning
    img.style.pointerEvents = "none"; // Prevent interaction
    return img;
}

const tickImage = createReusableFeedbackIcon('./tick.png');
const crossImage = createReusableFeedbackIcon('./cross.png');


export function animateFeedbackIcon(targetElement, imageType) {
    return new Promise((resolve) => {
        // Determine which image to use
        const image = imageType === 'tick' ? tickImage : crossImage;
        // image.classList.add('img')
        // Append the reusable image to the target element
        targetElement.appendChild(image);
        // void image.offsetWidth; // Trigger reflow to restart animation
        image.classList.add("animate__animated", "animate__slideOutUp");
        // Listen for the animationend event to remove the image
        image.addEventListener("animationend", function handleImageAnimation(event) {
            image.classList.remove("animate__animated", "animate__slideOutUp");
            targetElement.removeChild(image);
            image.removeEventListener("animationend", handleImageAnimation);
            resolve("trigger reusable animation resolved")
        },
            // { once: true });
        )
    });


}

// Animations

// Replace the disappearBox and appearBox methods with a single moveLetterBox method
export async function moveLetterBox(letterClicked, sourceRect, targetRect) {
    return new Promise((resolve) => {
        // Create a floating letter element that will animate from source to target
        const floatingLetter = document.createElement("div");
        floatingLetter.classList.add("box", "normal", "floating-letter");
        floatingLetter.textContent = letterClicked;
        document.body.appendChild(floatingLetter);

        // Position the floating letter at the source position
        floatingLetter.style.position = "fixed";
        floatingLetter.style.left = `${sourceRect.left}px`;
        floatingLetter.style.top = `${sourceRect.top}px`;
        floatingLetter.style.width = `${sourceRect.width}px`;
        floatingLetter.style.height = `${sourceRect.height}px`;
        floatingLetter.style.zIndex = "1000";

        // Force a reflow to ensure the initial position is applied
        void floatingLetter.offsetWidth;

        // Add transition for smooth movement
        floatingLetter.style.transition = "all 0.5s ease-in-out";

        // Move to target position
        floatingLetter.style.left = `${targetRect.left}px`;
        floatingLetter.style.top = `${targetRect.top}px`;
        floatingLetter.style.backgroundColor = "#4caf50"; // Change to green like the correct letters
        floatingLetter.style.color = "#fff";

        // Listen for the transition to end
        floatingLetter.addEventListener("transitionend", function handleTransition() {
            floatingLetter.removeEventListener("transitionend", handleTransition);
            document.body.removeChild(floatingLetter);
            resolve();
        });
    });
}

export async function showIncorrectLetterFeedback(box) {
    box.classList.add("wrong");
    await animateFeedbackIcon(box, 'cross');
    box.classList.remove("wrong");
}

export async function animateWordCompletion(topContainer) {
    return new Promise((resolve) => {
        const children = Array.from(topContainer.children);
        console.log(children);

        let completedAnimations = 0;
        // Animation
        children.forEach((box, _) => {
            const img = createFeedbackIcon('./tick.png');
            box.append(img);
            requestAnimationFrame(() => { // Introduce a delay
                img.classList.add("animate__animated", "animate__slideOutUp");

                img.addEventListener("animationend", function handleImageAnimation(event) {
                    completedAnimations++;
                    if (completedAnimations === children.length) {
                        resolve("animatewordcompletionresolved!");
                    }
                    img.removeEventListener("animationend", handleImageAnimation);
                    img.remove();
                });
            });

        })

    }, { once: true });

}

// UI renders and re-renders

// Render a single row (top row, bottom row or definition row)

export const updateWordRowDisplay = (container, rowData) => {
    container.innerHTML = ""; // Clear current content

    if (rowData.definitionRow) {
        console.log(rowData.definitionRow)
        container.innerText = rowData.definitionRow
    }

    if (rowData.topRow) {
        rowData.topRow.forEach(char => {
            const box = document.createElement("div");
            char == "" ?
                box.classList.add('box', 'underscored') :
                box.classList.add('box', 'normal', 'correct')
            box.textContent = char;
            container.appendChild(box);
        });
    };

    if (rowData.bottomRow) {
        rowData.bottomRow.forEach(char => {
            const box = document.createElement("div");
            // conditional rendering
            if (char == "") {
                box.classList.add("box", "hidden");
            } else {
                box.classList.add("box", "normal");
            }
            box.textContent = char;
            container.appendChild(box);
        });
    }
}