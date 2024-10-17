const callBtns = document.querySelectorAll('.btn');
const liftImages = document.querySelectorAll('.lift-img');
const arrivalSound = document.getElementsByClassName("lift-sound")[0];
let liftStates = Array(liftImages.length).fill('idle');
let liftCurrentPositions = Array.from(liftImages).map(lift => lift.getBoundingClientRect().top + window.scrollY);
let callQueue = [];

callBtns.forEach((btn) => {
    btn.classList.add('btn-call');
    btn.style.backgroundColor = 'green';
    btn.addEventListener("click", () => {
        console.log('Button clicked');
        btn.classList.remove('btn-call');
        btn.classList.add('btn-waiting');
        btn.innerHTML = 'Call (Waiting...)';
        btn.style.backgroundColor = 'red';
        btn.style.color = 'white';
        btn.disabled = true;

        const buttonRect = btn.getBoundingClientRect();
        const btnY = buttonRect.top + window.scrollY;
        const nearestLiftIndex = findNearestAvailableLift(btnY);

        if (nearestLiftIndex !== -1) {
            moveLift(nearestLiftIndex, btnY, btn);
        } else {
            callQueue.push({ btnY, btn });
            console.log('No available lifts. Adding to queue.');
        }
    });
});

function findNearestAvailableLift(targetY) {
    let nearestLiftIndex = -1;
    let shortestDistance = Infinity;

    liftCurrentPositions.forEach((liftY, index) => {
        if (liftStates[index] === 'idle' && liftCurrentPositions[index] !== targetY) {
            const distance = Math.abs(targetY - liftY);
            if (distance < shortestDistance) {
                shortestDistance = distance;
                nearestLiftIndex = index;
            }
        }
    });

    console.log('Nearest lift index:', nearestLiftIndex);
    return nearestLiftIndex;
}

function moveLift(liftIndex, targetY, btn) {
    const lift = liftImages[liftIndex];

    if (!lift.style.top) {
        lift.style.top = `${liftCurrentPositions[liftIndex]}px`;
    }

    lift.style.position = 'absolute';
    lift.classList.remove('lift-black');
    lift.classList.add('lift-red');
    lift.offsetHeight;

    const currentLiftY = liftCurrentPositions[liftIndex];
    const distance = Math.abs(targetY - currentLiftY);
    const speed = 80;
    const arrivalTime = (distance / speed) * 1000;

    updateTimeRemaining(liftIndex, lift, targetY, btn, arrivalTime);

    lift.style.transition = `top ${arrivalTime / 1000}s ease`;
    setTimeout(() => {
        lift.style.top = `${targetY}px`;
    }, 300);

    liftCurrentPositions[liftIndex] = targetY;
    liftStates[liftIndex] = 'moving';
    lift.style.backgroundColor = 'red';

    setTimeout(() => {
        btn.classList.remove('btn-waiting');
        btn.classList.add('btn-arrived');
        btn.innerHTML = 'Arrived';
        btn.style.backgroundColor = 'transparent';
        btn.style.border = '2px solid green';
        btn.style.color = 'green';
        lift.classList.remove('lift-red');
        lift.classList.add('lift-green');
        lift.style.backgroundColor = 'green';

        arrivalSound.play().catch(error => {
            console.error('Error playing sound:', error);
        });
    }, arrivalTime);

    setTimeout(() => {
        resetButtonAndLift(liftIndex, btn);
    }, arrivalTime + 2000);
}

function updateTimeRemaining(liftIndex, lift, targetY, btn, arrivalTime) {
    const startTime = Date.now();
    const interval = setInterval(() => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;
        const remainingTime = arrivalTime - elapsedTime;

        if (remainingTime <= 0) {
            clearInterval(interval);
            btn.innerHTML = `Arrived`;
        } else {
            const totalSeconds = Math.floor(remainingTime / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;

            btn.innerHTML = `Call (${minutes}m ${seconds}s)`;
        }
    }, 1000);
}

function resetButtonAndLift(liftIndex, btn) {
    btn.classList.remove('btn-arrived');
    btn.classList.add('btn-call');
    btn.innerHTML = 'Call';
    btn.style.backgroundColor = 'green';
    btn.style.color = 'white';
    btn.style.border = '';
    btn.disabled = false;

    const lift = liftImages[liftIndex];
    lift.classList.remove('lift-green');
    lift.classList.add('lift-black');
    lift.style.backgroundColor = '';
    liftStates[liftIndex] = 'idle';

    if (callQueue.length > 0) {
        const { btnY, btn: queuedBtn } = callQueue.shift();
        const nearestLiftIndex = findNearestAvailableLift(btnY);
        if (nearestLiftIndex !== -1) {
            moveLift(nearestLiftIndex, btnY, queuedBtn);
        }
    }
}

function resetButton(btn) {
    btn.style.backgroundColor = 'green';
    btn.style.color = 'white';
    btn.style.border = '';
    btn.classList.remove('btn-waiting');
    btn.classList.add('btn-call');
    btn.innerHTML = 'Call';
    btn.disabled = false;
}
