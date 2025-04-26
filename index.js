const negatives = [
    { word: 'illegal', definition: 'Against the law or rules; not lawful.' },
    { word: 'illegible', definition: 'Not clear enough to be read; unreadable.' },
    { word: 'immature', definition: 'Not fully developed; having or showing emotional or intellectual development appropriate to someone younger.' },
    { word: 'immortal', definition: 'Living forever; never dying or decaying.' },
    // { word: 'impossible', definition: 'Not able to occur, exist, or be done.' },
    // { word: 'impatient', definition: 'Having or showing a tendency to be quickly irritated or provoked.' },
    // { word: 'imperfect', definition: 'Not perfect; having faults or errors.' },
    // { word: 'irregular', definition: 'Not even or balanced in shape or arrangement; not following a pattern.' },
    // { word: 'irrelevant', definition: 'Not connected with or relevant to something.' },
    // { word: 'irresponsible', definition: 'Not showing a proper sense of responsibility.' }
];

const ationWords = [
    { word: 'information', definition: 'Facts provided or learned about something or someone.' },
    { word: 'sensation', definition: 'A physical feeling or perception resulting from something that happens to or comes into contact with the body.' },
    { word: 'preparation', definition: 'The action or process of making ready or being made ready for use or consideration.' },
    { word: 'vibration', definition: 'An instance of vibrating; a quivering or trembling motion.' },
    { word: 'decoration', definition: 'The process or art of decorating or adorning something.' },
    { word: 'donation', definition: 'Something that is given to a charity, especially a sum of money.' },
    { word: 'duration', definition: 'The time during which something continues.' },
    { word: 'registration', definition: 'The action or process of registering or of being registered.' },
    { word: 'population', definition: 'All the inhabitants of a particular place.' },
    { word: 'determination', definition: 'Firmness of purpose; resoluteness.' }
];

const ousWords = [
    { word: 'serious', definition: 'Yesterday we made our teacher very angry. He was very ...' },
    { word: 'obvious', definition: 'Of course, everyone knows this. It is ...' },
    { word: 'curious', definition: 'She always asks questions. She is very ...' },
    { word: 'hideous', definition: 'Eww, this animal is so ugly. It is ...' },
    { word: 'spontaneous', definition: 'He just told me I am beautiful. He seems very ...' },
    { word: 'courteous', definition: 'That man is so polite and ...' },
    { word: 'furious', definition: 'Fast and ...' },
    { word: 'various', definition: 'We have ... kinds of books in our library.' },
    { word: 'victorious', definition: 'After killing the enemy, the knight emerged ...' },
    { word: 'gaseous', definition: 'The liquid is now in its ... form.' }
];




const submitWords = () => {
    let arr = [];
    const words = [...document.querySelectorAll('.word')]
        .map(input => input.value.trim()).filter(word => word);
    const definitions = [...document.querySelectorAll('.definition')]
        .map(input => input.value.trim()).filter(definition => definition);

    words.forEach((word, index) => {
        let obj = {
            word: word,
            definition: definitions[index]
        }
        arr.push(obj)
    })
    localStorage.setItem('words', JSON.stringify(arr));
    window.location.href = "game2.html";
};


function submitSampleWords(arr) {
    switch (arr) {
        case 'negatives':
            arr = negatives;
            break;
        case 'ation':
            arr = ationWords;
            break;
        case 'ous':
            arr = ousWords
            break;
    }
    localStorage.setItem('words', JSON.stringify(arr));
    window.location.href = "game.html";
}


const createForm = () => {
    const wordList = document.querySelector('.wordList');
    for (let i = 0; i < 10; i++) {
        wordList.innerHTML += `
        <input type="text" placeholder="Word ${i + 1}" class="word">
        <input type="text" placeholder="Definition ${i + 1}" class="definition">
    `;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Dynamically create the form rows
    createForm();
    // submitWords();
})