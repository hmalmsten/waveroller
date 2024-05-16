const express = require('express');
const app = express();
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const countries = require('countries-list');

let clickCounts = [];

// Check if the file exists
if (fs.existsSync('clickCounts.json')) {
    // If the file exists, read the data into the clickCounts array
    clickCounts = JSON.parse(fs.readFileSync('clickCounts.json', 'utf8'));
} else {
    // If the file doesn't exist, create a new file with an empty array
    fs.writeFileSync('clickCounts.json', JSON.stringify([]));
}
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
app.use(express.static('public'));  // Serve static files from 'public' directory
app.use(express.json());

app.get('/counts', (req, res) => {
    console.log('Request:', req.query);
    const country = req.query.country || 'Finland';
    // Find the object for the country
    const countryObj = clickCounts.find(obj => obj.country === country);
    // Only fetch the click count, don't increment it
    const count = countryObj ? countryObj.clickCounts : 0;
    console.log('count:', count);
    // Send the count back to the client
    res.json({ count });
});


app.post('/click', (req, res) => {
    console.log("Request:", req.body)
    const country = req.body.country || 'Finland';
    const count = req.body.count || 0;
    const countryCode = req.body.countryCode || 'FI';

    // Validate the count
    if (count <= 0 || count > 130) {
        return //res.status(400).json({ error: 'Invalid count' });
    }

    // Validate the country
    if (!countries.countries[countryCode]) {
        return res.status(400).json({ error: 'Invalid country' });
    }

    // Find the index of the object for the country
    let index = clickCounts.findIndex(obj => obj.country === country);
    // If it doesn't exist, create a new object and push it to the array
    if (index === -1) {
        clickCounts.push({ country, countryCode, clickCounts: count });
    } else {
        // Increment the click count of the existing object
        clickCounts[index].clickCounts += count;
    }
    console.log ('clickCounts:', clickCounts);
    // Save the updated counts to a file or a database
    fs.writeFileSync('clickCounts.json', JSON.stringify(clickCounts));

    // Send the updated count back to the client
    res.json({ count: clickCounts[index].clickCounts });
});

app.get('/leaderboard', (req, res) => {
    const leaderboard = getLeaderboard();
    res.json({ leaderboard });
});

function getLeaderboard() {
    // Sort the clickCounts array by the clickCounts property of each object
    const sortedCounts = clickCounts.sort((a, b) => b.clickCounts - a.clickCounts);
    // Return the sorted array without slicing it
    return sortedCounts.map(({ country, countryCode, clickCounts }) => ({ country, countryCode, clickCounts }));
}

app.listen(3000, () => {
    console.log('Server running on port 3000');
});