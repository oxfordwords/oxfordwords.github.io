function getWord() {
    return getWordElement().textContent.toLowerCase();
}

function getAnswer() {
    return getAnswerElement().value.toLowerCase();
}

function getTranslations() {
    const translations = [];
    const translationElements = getTranslationElements();
    [].forEach.call(translationElements, function (el) {
        translations.push(el.textContent.toLowerCase())
    });
    return translations;
}

function getMinRatingWordsRandom(words) {
    let counts = [];
    words.forEach((element) => counts.push(getWordCount(element)));
    const min = Math.min.apply(Math, counts);
    const minRatingWords = words.filter((element) => getWordCount(element) === min);
    return minRatingWords[Math.floor(Math.random() * minRatingWords.length)];
}
function getRandomWord() {
    const exerciseWords = getExerciseWords();
    if (exerciseWords.length >= 30) {
        return getMinRatingWordsRandom(exerciseWords);
    } else {
        const differenceWords = words.filter(x => !exerciseWords.includes(x));
        return getMinRatingWordsRandom(differenceWords);
    }
}

function nextWord(sleep) {
    const nextWord = getRandomWord();
    setTimeout(function () {
        let url = '/' + nextWord + '.html';
        window.history.pushState("", "", url);
        window.location.replace(url);
    }, sleep);
}


function getWordCount(word) {
    if (!Number.isInteger(parseInt(localStorage.getItem(word)))) {
        localStorage.setItem(word, (0).toString());
    }
    return Number.parseInt(localStorage.getItem(word));
}

function printCount() {
    // getCountElement().textContent = getWordCount(getWord());
}


/**
 * find word from the table that most similar the given word. return the best match word with the number of differences.
 */
function findWord(word, table) {
    let bestMatch = {
        word: null,
        differences: Infinity
    };
    for (let i = 0; i < table.length; i++) {
        let differences = 0;
        for (let j = 0; j < word.length; j++) {
            if (word[j] !== table[i][j]) {
                differences++;
            }
            differences += Math.abs(word.length - table[i].length);
        }
        if (differences < bestMatch.differences) {
            bestMatch.word = table[i];
            bestMatch.differences = differences;
        }
    }
    return bestMatch;
}


function checkAnswer() {
    getResultElement().style.display = 'block';

    const answer = getAnswer();
    if (answer.length < 1) {
        return markAsEmpty();
    }

    const similar = findWord(answer, getTranslations());
    console.log(similar);
    if (similar.differences === 0) {
        return markAsCorrect(similar.word);
    }
    if (similar.differences < 3) {
        return markAsSimilar(similar.word);
    }

    return markAsIncorrect();
}

function changeRating(word, change) {
    localStorage.setItem(word, (parseInt(localStorage.getItem(word)) + change).toString());
}

function printExercise() {
    if (getWordCount(getWord()) > 3) {
        getNextExerciseButton().classList.add('done');
    }
    const el = document.getElementById('exercise');
    el.innerHTML = '';
    getExerciseWords().forEach((element, index) => el.innerHTML += (index+1) + '. ' + element + ' [' + getWordCount(element) + '], ')
}

function getExerciseWords() {
    let words = [];
    if (localStorage.getItem('exercise-words') !== null) {
        if (localStorage.getItem('exercise-words').split(';').length === 1) {
            words = [localStorage.getItem('exercise-words')];
        } else {
            words = localStorage.getItem('exercise-words').split(';');
        }
    }
    return words;
}

function addToExercise() {
    const word = getWord()
    const words = getExerciseWords();
    if (words.includes(word)) {
        return;
    }
    words.push(word);
    localStorage.setItem('exercise-words', words.join(';'));
}

function markAsEmpty() {
    addToExercise();
    changeRating(getWord(), 0)
    beep(50, 1000);
    nextWord(5000);
}

function markAsCorrect(answer) {
    getTranslationElement(answer).classList.add("correct");
    changeRating(getWord(), 1)
    beep(50, 3000);
    nextWord(3000);
}

function markAsSimilar(answer) {
    getTranslationElement(answer).classList.add("similar");
    changeRating(getWord(), 0)
    beep(50, 2000);
    nextWord(5000);
}

function markAsIncorrect() {
    addToExercise();
    changeRating(getWord(), -1)
    beep(300, 100);
    nextWord(5000);
}




/** music */

const utterance = new SpeechSynthesisUtterance('i');

(() => {
    return new Promise((resolve) => {
        if (speechSynthesis.getVoices().length === 0) {
            speechSynthesis.addEventListener('voiceschanged', resolve);
        } else {
            resolve();
        }
    });
})().then(() => {
    let voices = speechSynthesis.getVoices();
    // console.log(voices);
    for (let i = 0; i < voices.length; i++) {
        if (voices[i].name === 'Google US English') {
            utterance.voice = voices[i];
            break;
        }
    }
});

function beep(timeout, frequency) {
    let audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let oscillator = audioContext.createOscillator();
    let gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.type = "sawtooth";
    oscillator.frequency.value = frequency;
    gainNode.gain.value = 0.1;
    oscillator.start();
    setTimeout(function () {
        oscillator.stop();
    }, timeout);
}

function speak() {
    utterance.lang = 'en-US';
    utterance.text = getWord();
    console.log(utterance);
    window.speechSynthesis.speak(utterance);
}


/** listeners */



getNextExerciseButton().addEventListener("click", function () {
    localStorage.removeItem('exercise-words');
    printExercise();
});

getAnswerElement().addEventListener("click", function () {
    speak();
}, {once: true});

getAnswerElement().addEventListener("keydown", function (event) {
    if (event.key === "Escape" || event.keyCode === 27) {
        event.preventDefault();
        nextWord(0);
    }
});

getAnswerElement().addEventListener("keypress", function (event) {
    if ((event.key === "Space" || event.keyCode === 32) && event.currentTarget.value === "") {
        event.preventDefault();
        speak();
    }
    if (event.key === "Enter") {
        event.preventDefault();
        checkAnswer();
        printCount();
        printExercise();
    }
});

window.addEventListener('load', function () {
    printCount();
    printExercise();
    speak();
    getAnswerElement().focus();
})

/** handlers */


function getNextExerciseButton() {
    return document.getElementById("next-exercise");
}
function getAnswerElement() {
    return document.getElementById("answer");
}

function getCountElement() {
    return document.getElementById("count");
}

function getWordElement() {
    return document.getElementById('word');
}

function getResultElement() {
    return document.getElementById('result');
}

function getTranslationElements() {
    return document.getElementsByClassName("translation");
}


function getTranslationElement(translation) {
    return Array.from(document.querySelectorAll(".translation"))
        .find(el => el.textContent.toLowerCase() === translation);
}

