const callBtns = document.querySelectorAll('.btn');
const liftImages = document.querySelectorAll('.lift-img');
let liftStates = Array(liftImages.length).fill('idle');
let liftCurrentPositions = Array.from(liftImages).map(lift => lift.getBoundingClientRect().top + window.scrollY);

callBtns.forEach((btn) => {
    btn.classList.add('btn-call');
    btn.addEventListener("click", () => {
        console.log('Button clicked'); 
        btn.classList.remove('btn-call');
        btn.classList.add('btn-waiting');
        btn.innerHTML = 'waiting';
        btn.style.backgroundColor = 'red';
        btn.style.color = 'white';
        btn.disabled = true; 

        const buttonRect = btn.getBoundingClientRect();
        const btnY = buttonRect.top + window.scrollY;
        const nearestLiftIndex = findNearestAvailableLift(btnY);
        if (nearestLiftIndex !== -1) {
            moveLift(nearestLiftIndex, btnY, btn);
        } else {
            resetButton(btn);
        }
    });
});

function findNearestAvailableLift(targetY) {
    let nearestLiftIndex = -1;
    let shortestDistance = Infinity;
    liftCurrentPositions.forEach((liftY, index) => {
        if (liftStates[index] === 'idle') {
            const distance = Math.abs(targetY - liftY);
            if (distance < shortestDistance) {
                shortestDistance = distance;
                nearestLiftIndex = index;
            }
        }
    });
    console.log('Nearest lift index:', nearestLiftIndex); // Debug log for nearest lift index
    return nearestLiftIndex;
}

function moveLift(liftIndex, targetY, btn) {
    const lift = liftImages[liftIndex];
    lift.style.position = 'absolute';
    lift.classList.remove('lift-black');
    lift.classList.add('lift-red');
    lift.style.transition = 'top 4s ease';
    
    
    setTimeout(() => {
        lift.style.top = `${targetY}px`;
    }, 0);
    
    liftCurrentPositions[liftIndex] = targetY;
    liftStates[liftIndex] = 'moving';

    
    lift.style.backgroundColor = 'red'; 

    setTimeout(() => {
        btn.classList.remove('btn-waiting');
        btn.classList.add('btn-arrived');
        btn.innerHTML = 'Arrived';
        lift.classList.remove('lift-red');
        lift.classList.add('lift-green');
        lift.style.backgroundColor = 'red'; 
    
    }, 4000); 

    // After lift arrives
    setTimeout(() => {
        resetButtonAndLift(liftIndex, btn);
    }, 6000);
}

function resetButtonAndLift(liftIndex, btn) {
    btn.classList.remove('btn-arrived');
    btn.classList.add('btn-call');
    btn.innerHTML = 'call';
    btn.style.backgroundColor = '';
    btn.style.color = '';
    btn.disabled = false; 

    const lift = liftImages[liftIndex];
    lift.classList.remove('lift-green');
    lift.classList.add('lift-black');
    lift.style.backgroundColor = ''; 
    liftStates[liftIndex] = 'idle';
}

function resetButton(btn) {
    btn.style.backgroundColor = '';
    btn.style.color = '';
    btn.classList.remove('btn-waiting');
    btn.classList.add('btn-call');
    btn.innerHTML = 'call';
    btn.disabled = false; // Re-enable the button
}
