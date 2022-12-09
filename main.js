const contentCards = [
    "src/ahjufriikartulid.jpeg",
    "src/caesari-salat.jpeg",
    "src/dodster.jpeg",
    "src/double-pepperoni.jpeg",
    "src/jaatis.jpeg",
    "src/juusturullid.jpeg",
    "src/karuke.jpeg",
    "src/mojito.jpeg",
    "src/seene-starter.jpeg",
    "src/tasty-sticks.jpeg"];

const $cards = document.querySelector('#cards'),
    $notification = document.querySelector('#notification'),
    $endLayer = document.querySelector('#endGame'),
    $startLayer = document.querySelector('#startGame'),
    $cardsLayer = document.querySelector('#cards'),
    $start = document.querySelector('#start'),
    $restart = document.querySelector('#restart'),
    $score = document.querySelector('#score-count'),
    $scoreOk = document.querySelector('#score-right'),
    $phoneError = document.querySelector('#phone-error'),
    $resultAlert = document.querySelector('#result-alert'),
    $resultSuccess = document.querySelector('#result-success');

let firstCard,
    secondCard,
    checkCards = false,
    lockCards = false,
    countMatchs = 0,
    wrongs = 0,
    rights = 0,
    session = '';

//Stopwatch
var seconds = 00;
var tens = 00;
var appendTens = document.getElementById("tens");
var appendSeconds = document.getElementById("seconds");
var Interval;

//API
const baseURL = 'https://agile-chamber-47950.herokuapp.com'
const sessionEndpoint = '/api/session';
const scoreEndpoint = '/api/score';

$startLayer.classList.add('active');
$notification.classList.add('active');
$cardsLayer.classList.remove('active');


function endGame() {
    clearInterval(Interval);
    if (seconds < 120) {
        saveResult();
    } else {
        $resultAlert.textContent = 'Sa ei jõudnud 2 minutiga, palun proovi uuesti!'
        $endLayer.classList.add('active');
        $notification.classList.add('active');
        $cardsLayer.classList.remove('active');
    }
    document.body.classList.add('clip');
}

function checkMatch() {
    if (firstCard.dataset.id === secondCard.dataset.id) {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        firstCard.classList.add('match');
        secondCard.classList.add('match');
        [checkCards, lockCards] = [false, false];
        [firstCard, secondCard] = [null, null];
        ++rights;
        ++countMatchs;
        $scoreOk.textContent = countMatchs;
        if (countMatchs === contentCards.length) {
            console.log("Game ended!");
            endGame();
        }
    }
    else {
        wrongs++
        setTimeout(() => {
            firstCard.classList.toggle('flip');
            secondCard.classList.toggle('flip');
            [checkCards, lockCards] = [false, false];
            [firstCard, secondCard] = [null, null];
        }, 1000);
    }
    $score.textContent = rights + wrongs;
}

function flipCard() {
    if (lockCards) return;
    if (firstCard === this) return;
    if (!checkCards) {
        firstCard = this;
        this.classList.toggle('flip');
        checkCards = true;
    }
    else {
        secondCard = this;
        this.classList.toggle('flip');
        lockCards = true;
        checkMatch();
    }
}

function shuffleCards(arr) {
    for (let i = 0; i < arr.length; ++i) {
        arr[i].style.order = Math.floor(Math.random() * arr.length);
    }
}

function fillCards() {
    let allCards = [];

    contentCards.forEach((link, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.setAttribute('data-id', index);
        //Card back
        const cardBack = document.createElement('div');
        cardBack.classList.add('card__back');
        var backImg = document.createElement("img");
        backImg.setAttribute("src", "src/logo.png");
        backImg.classList.add('card-img-back');
        cardBack.appendChild(backImg);

        //Card front
        const cardFront = document.createElement('div');
        cardFront.classList.add('card__front');
        var frontImg = document.createElement("img");
        frontImg.setAttribute("src", link);
        frontImg.classList.add('card-img-front');
        cardFront.appendChild(frontImg);

        card.appendChild(cardBack);
        card.appendChild(cardFront);
        let cloneCard = card.cloneNode(true);
        allCards.push(card);
        allCards.push(cloneCard);
    });

    allCards.forEach(card => $cards.appendChild(card));
    allCards.forEach(card => card.addEventListener('click', flipCard));
    shuffleCards(allCards);
}

function startGame() {
    document.body.classList.remove('clip');
    $cards.innerHTML = '';
    $endLayer.classList.remove('active');
    $startLayer.classList.remove('active');
    $notification.classList.remove('active');
    $cardsLayer.classList.add('active');
    $score.textContent = $scoreOk.textContent = 0;
    countMatchs = wrongs = rights = 0;
    fillCards();
    // Stopwatch
    clearInterval(Interval);
    Interval = setInterval(startTimer, 10);
    startTimer();
}

$start.addEventListener('click', e => {
    e.preventDefault();
    phone = document.getElementById('phone').value;
    phone = phone.replace(/\s/g, '');
    if (validatePhoneNumber(phone)) {
        getSession(phone)
    } else {
        alert('Vigane telefoni number')
    }
});

$restart.addEventListener('click', e => {
    e.preventDefault();
    restartGame();
});

function restartGame() {
    clearTimer();
    clearInterval(Interval);
    Interval = setInterval(startTimer, 10);
    document.body.classList.remove('clip');
    $resultAlert.textContent = '';
    $resultSuccess.textContent = '';
    $phoneError.textContent = '';
    startGame();
    startTimer();
}

function validatePhoneNumber(input_str) {
    var re = /^\+3725\d{6,8}|\+\d{8,16}$/;
    return re.test(input_str);
}

function startTimer() {
    tens++;
    if (tens <= 9) {
        appendTens.innerHTML = "0" + tens;
    }
    if (tens > 9) {
        appendTens.innerHTML = tens;
    }
    if (tens > 99) {
        seconds++;
        appendSeconds.innerHTML = "0" + seconds;
        tens = 0;
        appendTens.innerHTML = "0" + 0;
    }
    if (seconds > 9) {
        appendSeconds.innerHTML = seconds;
    }
    if (seconds > 120) {
        endGame();
    }
}

function clearTimer() {
    clearInterval(Interval);
    tens = "00";
    seconds = "00";
    appendTens.innerHTML = tens;
    appendSeconds.innerHTML = seconds;
}

function getSession(phone) {
    let url = baseURL + sessionEndpoint;
    fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            phone: phone,
            game: "cards-ee",
        }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    })
        .then((response) => response.json())
        .then((json) => validateSessionResponse(json));
}

function validateSessionResponse(json) {
    console.log(json);
    if (json.type === 'session') {
        session = json.message;
        startGame();
    } else {
        $phoneError.textContent = translateBackendError(json.type)
    }
}

function saveResult() {
    let url = baseURL + scoreEndpoint;
    fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            session: session,
            matches: rights.toString(),
            moves: (rights + wrongs).toString(),
            seconds: seconds.toString()
        }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    })
        .then((response) => response.json())
        .then((json) => validateResultResponse(json));
}

function validateResultResponse(json) {
    console.log(json);
    if (json.type === 'OK') {
        $resultSuccess.textContent = 'Palju õnne, SMS kingitusega saadetakse märgitud telefoninumbrile 15 minuti jooksul. Ootame sind homme taas!'
    } else {
        $resultAlert.textContent = translateBackendError(json.type)
    }
    $endLayer.classList.add('active');
    $notification.classList.add('active');
    $cardsLayer.classList.remove('active');
}

function translateBackendError(errorCode) {
    switch (errorCode) {
        case 'error-01':
            return 'Telefoninumber on vigane'
        case 'error-02':
            return 'Telefoninumber on vigane'
        case 'error-03':
            return 'Sa juba mängisid täna, ootame sind homme taas!'
        case 'error-05':
            return 'Sa juba mängisid täna, ootame sind homme taas!'
        default:
            return 'Tundmatu viga, palun proovi hiljem uuesti'
    }
}