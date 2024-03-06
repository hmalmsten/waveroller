const express = require('express');
const app = express();
const fs = require('fs');

let clickCounts = [];

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
    // Find the object for the country
    let countryObj = clickCounts.find(obj => obj.country === country);
    // If it doesn't exist, create a new object and push it to the array
    if (!countryObj) {
        countryObj = { country, countryCode, clickCounts: 0 };
        clickCounts.push(countryObj);
    }
    // Increment the click count
    countryObj.clickCounts += count;
    console.log ('clickCounts:', countryObj.clickCounts);
    // Save the updated counts to a file or a database
    fs.writeFileSync('clickCounts.json', JSON.stringify(clickCounts));

    // Send the updated count back to the client
    res.json({ count: countryObj.clickCounts });
});

app.get('/leaderboard', (req, res) => {
    const leaderboard = getLeaderboard(5);
    res.json({ leaderboard });
});

function getLeaderboard(limit) {
    // Sort the clickCounts array by the clickCounts property of each object
    const sortedCounts = clickCounts.sort((a, b) => b.clickCounts - a.clickCounts);
    // Slice the array to get the top 'limit' countries and return it
    return sortedCounts.slice(0, limit).map(({ country, countryCode, clickCounts }) => ({ country, countryCode, clickCounts }));
}

app.listen(3000, () => {
    console.log('Server running on port 3000');
});