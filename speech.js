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
    console.log(voices);
    for (let i = 0; i < voices.length; i++) {
        if (voices[i].name === 'Google US English') {
            utterance.voice = voices[i];
            break;
        }
    }
});

function randomWord() {
    const wordKeys = Object.keys(words)
    return wordKeys[Math.floor(Math.random() * wordKeys.length)];
}

function nextWord(sleep) {
    const nextWord = randomWord();
    setTimeout(function() {
        let url =  '/'+nextWord+'.html';
        window.history.pushState("", "", url);
        window.location.replace(url);
    }, sleep);
}
function printCount() {
    const word = document.querySelector('h1').textContent;
    if (!Number.isInteger(parseInt(localStorage.getItem(word)))) {
        localStorage.setItem(word, (0).toString());
    }
    document.getElementById("count").textContent = localStorage.getItem(word);
}

function speak() {
    utterance.text = document.querySelector('h1').textContent;
    console.log(utterance);
    window.speechSynthesis.speak(utterance);
}

document.getElementById("answer").addEventListener("click", function(event) {
  speak();
});

document.getElementById("answer").addEventListener("keypress", function(event) {
    if((event.key === "Space" || event.keyCode === 32) && event.currentTarget.value === "") {
        event.preventDefault();
        speak();
    }
    if (event.key === "Enter") {
        event.preventDefault();
        checkAnswer();
        printCount();
    }
});

function checkAnswer() {
    const question = document.querySelector('h1');
    const answer = document.getElementById("answer");
    const description = document.getElementById("description");

    const word = question.textContent.toLowerCase();
    const answerWord = answer.value.toLowerCase();
    const translations = answer.dataset.word.toLowerCase().split(';');
    const translationBest = translations.shift();
    const result = (answerWord === translationBest || translations.includes(answerWord));

    console.log([word, translations, translationBest, result]);

    if (result) {
        console.log('+1');
        localStorage.setItem(word, (parseInt(localStorage.getItem(word)) + 1).toString());
        beep(true);
        nextWord(1000);
    } else {
        console.log('-1');
        answer.value = translationBest;
        description.innerHTML = translations.join('; ');
        localStorage.setItem(word, (parseInt(localStorage.getItem(word)) -1).toString());
        beep(false);
        nextWord(3000);
    }
}



window.addEventListener('load', function() {
    printCount();
    speak();
    document.getElementById("answer").focus();
})


function beep(success = true) {
    let audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let oscillator = audioContext.createOscillator();
    let gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.type = "sawtooth";
    oscillator.frequency.value = success === true ? 3000 : 100;
    gainNode.gain.value =  0.3;
    oscillator.start();
    setTimeout(function() {
        oscillator.stop();
    }, success === true ? 50 : 500);
}