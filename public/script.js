let clickCounts = {};

// Initialize the selected country
async function getCountry() {
    try {
        const response = await fetch('https://ipwho.is/');
        const data = await response.json();
        console.log('Country data:', data);
        const country = data.country;
        const code = data.country_code;
        return [country, code];
    } catch (error) {
        console.error('Error getting country:', error);
        return 'Finland', 'FI'; // Default country if detection fails
    }
}
 
// Initialize the selected country
getCountry().then((data) => {
    // Fetch initial click count and leaderboard data
    userCountry = data[0];
    countryCode = data[1];
    updateCounter();
    updateFlag(countryCode);

    fetch('/leaderboard')
        .then(response => response.json())
        .then(data => updateLeaderboard(data.leaderboard))
        .catch(error => console.error('Error:', error));
});

function storeEnergy(amount) {
    const counterElement = document.getElementById('click-counter');
    // Increment the click count for the selected country

    // Update the click count on the server
    updateServerClickCount(userCountry, countryCode, amount);

    counterElement.classList.add('shake');

    // Remove the shake class when the animation ends
    counterElement.addEventListener('animationend', () => {
        counterElement.classList.remove('shake');
    });

    // Fetch and update the leaderboard for all countries
    fetch('/leaderboard')
        .then(response => response.json())
        .then(data => updateLeaderboard(data.leaderboard))
        .catch(error => console.error('Error:', error));
}

function updateCounter() {
    const counterElement = document.getElementById('click-counter');
    fetch(`/counts?country=${userCountry}`)
    .then(response => response.json())
    .then(data => {
        counterElement.textContent = data.count;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function updateServerClickCount(country, countryCode, count) {
    // Update the click count on the server for the specified country
    console.log('Updating click count for', country, 'by', count);
    fetch('/click', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ country: country, countryCode: countryCode, count: count }),
    })
    .then(updateCounter())
    .catch(error => {
        console.error('Error:', error);
    });
}

function updateLeaderboard() {
    // Get the leaderboard container
    var leaderboardContainer = document.getElementById('all-countries');

    // Clear the current leaderboard
    while (leaderboardContainer.firstChild) {
        leaderboardContainer.removeChild(leaderboardContainer.firstChild);
    }

    // Fetch the updated leaderboard data from the server
    fetch('/leaderboard')
        .then(response => response.json())
        .then(data => {
            const leaderboard = data.leaderboard;
            const topCountry = data.leaderboard[0]; // Get the top country

            // Create the HTML for the top country
            var countryHTML = `
                <div>
                    <span class="rank">1</span>
                    <img class="flag" src="https://flagsapi.com/${topCountry.countryCode}/flat/24.png" alt="flag">
                    <span class="country-name">${topCountry.country}</span>
                </div>
                <span class="score">${topCountry.clickCounts}</span>
            `;

            // Update the top country in the leaderboard
            document.getElementById('top-country').innerHTML = countryHTML;

            // Create new elements for each country in the leaderboard
            leaderboard.slice(1).forEach((country, index) => {
                var countryElement = document.createElement('div');
                countryElement.className = 'leaderboard-item';
                countryElement.innerHTML = `
                    <div>
                        <span class="rank">${index + 1}</span>
                        <img class="flag" src="https://flagsapi.com/${country.countryCode}/flat/24.png" alt="flag">
                        <span class="country-name">${country.country}</span>
                    </div>
                    <span class="score">${country.clickCounts}</span>
                `;
                leaderboardContainer.appendChild(countryElement);
            });
        })
        .catch(error => console.error('Error:', error));
}

function updateFlag(countryCode) {
    // Update the flag display
    const flagElement = document.getElementById('country-flag');
    flagElement.innerHTML = `<img src="https://flagsapi.com/${countryCode}/flat/64.png" alt="Flag of ${countryCode}">`;
}

let progress = 0; // Progress starts at 0%

function updateProgress() {
    const progressBarFill = document.getElementById('progress-fill');
    progressBarFill.style.height = `${progress}%`;
}

// Get the current date and hour
// Initialize the button click count
let buttonClickCount = 0;

// Initialize the fill percentage at 75%
let fillPercentage = 75;

setInterval(function() {
    const progressBar = document.getElementById('progress-bar');
    if (progress > 0) { // Only decrease progress if it's greater than 0
        progress -= 0.05 * ((0.013 * fillPercentage) + 0.01); // Decrease progress by 0.05% every 10ms
        updateProgress(); // Update the progress bar
    }
    if (progress > 80 && !progressBar.classList.contains('smallshake')){
        progressBar.classList.add('smallshake');
    } else if (progress == 80) {
        setTimeout(function() {
            progressBar.classList.remove('smallshake');
        }, 100);
    }
}, 10); 


let lastRotationTime = Date.now();

let images = [];
for (let i = 0; i <= 30; i++) {
    let img = new Image();
    img.src = `roller(${i}).png`;
    images.push(img);
}


let currentFrame = 0;

function updatePointer() {
    document.body.style.backgroundImage = `url('${images[currentFrame].src}')`;
}

let intervalId = null;

// Function to update the fill percentage
function updateFillPercentage() {
    // Generate a random number between 0 and 1
    let random = Math.random();

    // If the random number is less than 0.5, decrease the fill percentage by 5%
    // Otherwise, increase it by 3%
    fillPercentage += random < 0.5 ? -4 : 3;

    // Ensure the fill percentage stays within the range 0-100%
    fillPercentage = Math.max(0, Math.min(100, fillPercentage));

    // Update the height of the fill element
    fill.style.height = fillPercentage + '%';
}

// Update the fill element when the page loads
var fill = document.getElementById('slider-fill');
fill.style.height = fillPercentage + '%';

document.getElementById('right-button').onclick = function() {
    if (currentFrame != images.length - 1) {
    // Clear the previous interval
    if (intervalId) {
        clearInterval(intervalId);
    }

    // Disable the right button and enable the left button
    this.disabled = true;
    document.getElementById('left-button').disabled = false;

    rotateApparatus();

    intervalId = setInterval(function() {
        currentFrame = (currentFrame + 1) % images.length; // Increment the frame index
        updatePointer(); // Update the pointer image
        if (currentFrame === images.length - 1) {
            clearInterval(intervalId); // Stop the interval when the last frame is reached
            // Enable the right button
            document.getElementById('right-button').disabled = false;
        }
    }, 1000 / images.length); // Set the interval so that all frames are shown within a second
}

    buttonClickCount++;
    if (buttonClickCount % 5 === 0) {
        updateFillPercentage();
    }
}

document.getElementById('left-button').onclick = function() {
    if (currentFrame != 0) {
    // Clear the previous interval
    if (intervalId) {
        clearInterval(intervalId);
    }

    // Disable the left button and enable the right button
    this.disabled = true;
    document.getElementById('right-button').disabled = false;

    rotateApparatus();

    intervalId = setInterval(function() {
        currentFrame = (currentFrame - 1 + images.length) % images.length; // Decrement the frame index
        updatePointer(); // Update the pointer image
        if (currentFrame === 0) {
            clearInterval(intervalId); // Stop the interval when the first frame is reached
            // Enable the left button
            document.getElementById('left-button').disabled = false;
        }
    }, 1000 / images.length); // Set the interval so that all frames are shown within a second
}
    buttonClickCount++;
    if (buttonClickCount % 5 === 0) {
        updateFillPercentage();
    }
}

document.getElementById('right-button').onmousedown = function() {
    this.classList.add('button-pressed');
}

document.getElementById('right-button').onmouseup = function() {
    this.classList.remove('button-pressed');
}

document.getElementById('left-button').onmousedown = function() {
    this.classList.add('button-pressed');
}

document.getElementById('left-button').onmouseup = function() {
    this.classList.remove('button-pressed');
}

document.addEventListener('DOMContentLoaded', function() {
    window.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowRight') {
            const leftButton = document.getElementById('left-button');
            leftButton.click();
            leftButton.classList.add('button-pressed');
        }
        if (event.key === 'ArrowLeft') {
            const rightButton = document.getElementById('right-button');
            rightButton.click();
            rightButton.classList.add('button-pressed');
        }
    });

    window.addEventListener('keyup', function(event) {
        if (event.key === 'ArrowRight') {
            document.getElementById('left-button').classList.remove('button-pressed');
        }
        if (event.key === 'ArrowLeft') {
            document.getElementById('right-button').classList.remove('button-pressed');
        }
    });
});
   

function rotateApparatus() {
    //const apparatusImg = document.getElementById('apparatus-img');
    //apparatusImg.style.transform = `rotate(${rotation}deg)`;
    penalty = 1
    bonus = 1
    const timeDifference = Date.now() - lastRotationTime;
        lastRotationTime = Date.now();
    const progressBar = document.getElementById('progress-bar');
    if (timeDifference > 1000) {
        // If more than 0.5 seconds have passed, reward the player with more progress
        progress += 10 / (progress * 0.04 + 1);
    if (timeDifference < 1050) {
        // good timing reward
        progress += 6 / (progress * 0.04 + 1)
        bonus = 1.3
        progressBar.classList.add('smallshake');
        setTimeout(function() {
            progressBar.classList.remove('smallshake');
        }, 100);
    
    }
    } else {
        // If less than 0.5 seconds have passed, punish the player with less progress
        penalty = timeDifference / 1000;
        progress += (10 / (progress * 0.04 + 1)) * penalty;
    }

    if (progress > 80) {
        // If it is, add the smallshake class to the progress bar
        progressBar.classList.add('smallshake');
    } else {
        // If it's not, remove the smallshake class
        setTimeout(function() {
            progressBar.classList.remove('smallshake');
        }, 100);
    }

    if (progress > 100) {
        progress = 100; // Cap the progress at 100%
    }
    storeEnergy(Math.round(progress * penalty * bonus));
    updateProgress();
}
document.getElementById('leaderboard').addEventListener('click', function() {
    updateLeaderboard();
    var leaderboard = document.getElementById('leaderboard');
    var allCountries = document.getElementById('all-countries');

    if (leaderboard.style.maxHeight !== '75vh') {
        leaderboard.style.maxHeight = '75vh';
    } else {
        leaderboard.style.maxHeight = '46px';    }
});